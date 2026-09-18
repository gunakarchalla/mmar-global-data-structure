/**
 * # Attribute values and the pattern that constrains them
 *
 * An attribute type carries a regular expression in `regex_value`, and everything
 * stored under an attribute of that type has to match it: the instance values the
 * modeling client writes, and the default value and facets the metamodeling client
 * writes. The server, the modeling client and the metamodeling client all answer that
 * question here, so a value accepted in one place cannot be refused in another — a
 * refusal that reaches the server as a 403 costs the modeling client its whole scene,
 * which is rolled back to the last snapshot and re-imported.
 *
 * How the pattern is read:
 *
 * - The pattern is stored as TEXT, entered by a metamodel author in the metamodeling
 *   client. `regex_value` is declared a RegExp in `AttributeType`, but the API carries
 *   it as a string and that is what the database holds, so both forms are accepted here.
 * - It is compiled WITHOUT flags. The check used to apply "gmi": "i" made the pattern
 *   case-blind, which no stored pattern asks for, and "m" anchored per LINE, so a
 *   multi-line value satisfied a "^...$" pattern as long as one of its lines did —
 *   `"hello\n12"` passed as a Float. Neither is what an author writes a pattern for.
 * - The whole value must match, so an author who leaves the anchors off still gets the
 *   constraint they meant: `[0-9]+` describes a number, not "contains a digit". Every
 *   pattern stored today is anchored already, and wrapping an anchored pattern changes
 *   nothing about what it accepts.
 * - A type that states no pattern constrains nothing, and so does a pattern that cannot
 *   be compiled: it is not a rule this code can apply, and refusing every value of the
 *   type would be a worse answer than accepting them. Patterns are checked where they
 *   are written instead — see `is_valid_pattern`.
 *
 * Whether a value may be EMPTY is the pattern's business too, and not a separate rule:
 * an attribute whose type accepts "" may be left unset, one whose type does not must
 * carry a value. That is why an unset value is stored as "" rather than as a placeholder
 * string: a placeholder is a value the pattern has to accept on top of the real ones.
 */

/** A pattern as it is stored and as `AttributeType` declares it. */
export type AttributeValuePattern = string | RegExp | null | undefined;

/** The separator between the facets of an attribute: `"red|green|blue"`. */
export const FACET_SEPARATOR = "|";

/**
 * @description - The pattern as text, or null when the type states none.
 */
export function pattern_source(pattern: AttributeValuePattern): string | null {
    if (pattern === null || pattern === undefined) return null;
    const source = pattern instanceof RegExp ? pattern.source : String(pattern);
    return source === "" ? null : source;
}

/**
 * @description - The pattern, compiled for a whole-value match, or null when there is
 * nothing to apply: no pattern, or one that does not compile.
 */
function compiled_pattern(pattern: AttributeValuePattern): RegExp | null {
    const source = pattern_source(pattern);
    if (source === null) return null;
    try {
        // The group is non-capturing so that a pattern which is itself an alternation
        // ("^a$|^b$") keeps its meaning inside the wrapper.
        return new RegExp(`^(?:${source})$`);
    } catch {
        return null;
    }
}

/**
 * @description - Whether a pattern can be compiled at all. A metamodel author types the
 * pattern by hand, and an unbalanced group ("^(abc") is a SyntaxError rather than a
 * pattern that refuses everything — so the clients report it as they type and refuse to
 * save it, instead of storing a rule nothing can apply.
 * @param {AttributeValuePattern} pattern - The pattern to compile.
 * @returns {boolean} - True when the type states no pattern, or states one that compiles.
 */
export function is_valid_pattern(pattern: AttributeValuePattern): boolean {
    const source = pattern_source(pattern);
    if (source === null) return true;
    try {
        new RegExp(source);
        return true;
    } catch {
        return false;
    }
}

/**
 * @description - Whether a value satisfies the pattern of its attribute type.
 *
 * `undefined` is the one value that is not tested: it does not mean an empty value but a
 * field that was not sent, which the server's writes keep as it is stored. `null` and ""
 * are the empty value, which the pattern decides on like any other.
 * @param {string | null | undefined} value - The value to test.
 * @param {AttributeValuePattern} pattern - The pattern of the attribute's type.
 * @returns {boolean} - True when the value is allowed.
 */
export function value_matches_pattern(
    value: string | null | undefined,
    pattern: AttributeValuePattern,
): boolean {
    if (value === undefined) return true;
    const regex = compiled_pattern(pattern);
    if (regex === null) return true;
    return regex.test(value === null ? "" : String(value));
}

/**
 * @description - The facets that the pattern refuses.
 *
 * Facets are the values an attribute may take, written as one string: either the choices
 * of a dropdown ("Timer|Detect|Voice") or the bounds of a slider ("0|7.28|0.01"). Both
 * readings are values of the attribute, so both are held to the attribute type's pattern
 * — a choice the pattern refuses is one the modeling client would refuse the moment it
 * was picked.
 *
 * An empty string is not one empty facet but no facets at all, and is never a violation.
 * "|||" on the other hand is four empty facets, which a pattern that accepts "" allows
 * and one that does not refuses.
 * @param {string | null | undefined} facets - The facets, separated by `FACET_SEPARATOR`.
 * @param {AttributeValuePattern} pattern - The pattern of the attribute's type.
 * @returns {string[]} - The offending facets, in the order they were written.
 */
export function facets_not_matching_pattern(
    facets: string | null | undefined,
    pattern: AttributeValuePattern,
): string[] {
    if (facets === undefined || facets === null || facets === "") return [];
    const regex = compiled_pattern(pattern);
    if (regex === null) return [];
    return String(facets)
        .split(FACET_SEPARATOR)
        .filter((facet) => !regex.test(facet));
}

/**
 * @description - What is wrong with an attribute's stored values, as sentences, or an
 * empty array when there is nothing wrong. The single answer the metamodeling client
 * shows as it types and the server refuses a write with.
 * @param {object} attribute - The attribute's default value and facets.
 * @param {AttributeValuePattern} pattern - The pattern of the attribute's type.
 * @returns {string[]} - One entry per violation.
 */
export function attribute_value_violations(
    attribute: { default_value?: string | null; facets?: string | null },
    pattern: AttributeValuePattern,
): string[] {
    const problems: string[] = [];
    if (!value_matches_pattern(attribute.default_value, pattern)) {
        problems.push(
            `the default value ${JSON.stringify(attribute.default_value ?? "")} does not match the regular expression of the attribute type`,
        );
    }
    const facets = facets_not_matching_pattern(attribute.facets, pattern);
    if (facets.length > 0) {
        problems.push(
            `the facet(s) ${facets.map((facet) => JSON.stringify(facet)).join(", ")} do not match the regular expression of the attribute type`,
        );
    }
    return problems;
}
