/**
 * @description - Whether writing an object would actually change anything.
 *
 * `get_collection_difference` used to report every object present on both sides
 * as `modified`, without comparing a single field, and its callers write
 * everything in `modified`. An autosave that moved one node of a 150-object
 * scene therefore rewrote all of it, and the clients autosave the whole scene.
 *
 * This describes, per class, what a write of that class actually puts in the
 * database: the columns its `update()` writes, and the subtrees its `update()`
 * recurses into. A class that does not describe itself is always reported as
 * modified — the previous, always-write behaviour is the fallback, so a write
 * path nobody has modelled here is never skipped.
 */

export type WriteSpec = {
    /**
     * Columns written as `coalesce($n, column)`. A null or undefined incoming
     * value keeps what is stored, so it can never be a difference. A dotted path
     * reads through a nested object, for the updates that write a child's uuid
     * rather than the child.
     */
    fields?: string[];
    /**
     * Columns written unconditionally. A null incoming value overwrites, so it
     * differs whenever the stored value is not null.
     */
    hard_fields?: string[];
    /**
     * Properties holding objects — an array of them, or a single one — that this
     * class's `update()` recurses into. Compared against their own spec.
     */
    children?: string[];
    /**
     * Properties whose write path is not a plain UPDATE and is not modelled here
     * (a create, for instance). Any value present makes the object dirty.
     */
    opaque?: string[];
};

/**
 * @description - A class describes its own write by implementing this. Returning
 * null means "not modelled": the object is always written.
 */
export interface WriteDescribed {
    get_write_spec(): WriteSpec | null;
}

function spec_of(object: unknown): WriteSpec | null {
    const candidate = object as Partial<WriteDescribed> | null | undefined;
    if (!candidate || typeof candidate.get_write_spec !== "function") return null;
    return candidate.get_write_spec();
}

function read_path(object: unknown, path: string): unknown {
    let value: unknown = object;
    for (const step of path.split(".")) {
        if (value === null || value === undefined) return undefined;
        value = (value as Record<string, unknown>)[step];
    }
    return value;
}

/**
 * @description - Structural equality, tolerant of the type differences between a
 * value parsed from the client's JSON and the same value read back from
 * postgres. 5 and "5" land in the same integer column, and so do true and
 * "true": writing one over the other changes nothing, which is the only question
 * being asked here.
 */
export function same_written_value(a: unknown, b: unknown): boolean {
    if (a === b) return true;
    if (a === null || a === undefined) return b === null || b === undefined;
    if (b === null || b === undefined) return false;

    if (a instanceof Date || b instanceof Date) {
        return (
            a instanceof Date && b instanceof Date && a.getTime() === b.getTime()
        );
    }

    if (Array.isArray(a) || Array.isArray(b)) {
        if (!Array.isArray(a) || !Array.isArray(b)) return false;
        if (a.length !== b.length) return false;
        return a.every((item, index) => same_written_value(item, b[index]));
    }

    if (typeof a === "object" && typeof b === "object") {
        const record_a = a as Record<string, unknown>;
        const record_b = b as Record<string, unknown>;
        const keys_a = Object.keys(record_a).filter((k) => record_a[k] !== undefined);
        const keys_b = Object.keys(record_b).filter((k) => record_b[k] !== undefined);
        if (keys_a.length !== keys_b.length) return false;
        return keys_a.every(
            (k) => k in record_b && same_written_value(record_a[k], record_b[k])
        );
    }

    if (typeof a === "object" || typeof b === "object") return false;

    return String(a) === String(b);
}

function children_would_change(incoming: unknown, stored: unknown): boolean {
    // Nothing sent, nothing written.
    if (incoming === null || incoming === undefined) return false;

    if (Array.isArray(incoming)) {
        const stored_by_uuid = new Map<string, unknown>();
        if (Array.isArray(stored)) {
            for (const child of stored) {
                const uuid = (child as { uuid?: string } | null)?.uuid;
                if (uuid !== undefined && !stored_by_uuid.has(uuid)) {
                    stored_by_uuid.set(uuid, child);
                }
            }
        }
        for (const child of incoming) {
            const uuid = (child as { uuid?: string } | null)?.uuid;
            // Nothing to match it against, so assume it is written.
            if (uuid === undefined) return true;
            const stored_child = stored_by_uuid.get(uuid);
            // It is not stored yet: the update would create it.
            if (stored_child === undefined) return true;
            if (write_would_change(child, stored_child)) return true;
        }
        return false;
    }

    if (stored === null || stored === undefined) return true;
    return write_would_change(incoming, stored);
}

/**
 * @description - Whether writing `incoming` over `stored` would put anything
 * different in the database, following the subtrees the write recurses into.
 * Answers true whenever it cannot tell.
 */
export function write_would_change(incoming: unknown, stored: unknown): boolean {
    if (stored === null || stored === undefined) return true;

    const spec = spec_of(incoming);
    // Not modelled: keep the previous behaviour and write it.
    if (!spec) return true;

    for (const path of spec.fields ?? []) {
        const value = read_path(incoming, path);
        // coalesce keeps the stored value, so this writes nothing.
        if (value === null || value === undefined) continue;
        if (!same_written_value(value, read_path(stored, path))) return true;
    }

    for (const path of spec.hard_fields ?? []) {
        if (!same_written_value(read_path(incoming, path), read_path(stored, path))) {
            return true;
        }
    }

    for (const name of spec.opaque ?? []) {
        const value = read_path(incoming, name);
        if (value !== null && value !== undefined) return true;
    }

    for (const name of spec.children ?? []) {
        if (children_would_change(read_path(incoming, name), read_path(stored, name))) {
            return true;
        }
    }

    return false;
}
