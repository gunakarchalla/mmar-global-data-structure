import {UUID} from "../meta/Metamodel_metaobjects.structure";

/**
 * # Table attributes
 *
 * An attribute whose type lists columns (`AttributeType.has_table_attribute`) is a
 * table. Its instance holds the table's cells in `table_attributes`, and the rules for
 * them are the same everywhere: the database constraints, the server's validation and
 * both clients all follow this file.
 *
 * - A column is a `ColumnStructure`: the attribute its cells are instances of, and its
 *   `sequence`, the column's position counted from 1.
 * - A cell is an `AttributeInstance` of its column's attribute, whose
 *   `table_attribute_reference` is the uuid of the table instance it belongs to and
 *   whose `table_row` is its row, counted from 0.
 * - Rows are numbered 0..n-1 without gaps, and a row holds at most one cell per column.
 *   A row can lack the cell of a column added to the type after the row was created;
 *   that position is empty until a cell is written to it.
 * - A cell whose column attribute is itself a table is a nested table and holds its own
 *   cells by the same rules.
 * - The server returns cells ordered by row, then by column. Writing a table replaces
 *   its cells: a cell that is no longer sent is deleted.
 *
 * The helpers take plain objects as well as revived instances, because not every
 * client revives its JSON into the gds classes.
 */

/** What the table helpers read and write of a cell. An `AttributeInstance` is one. */
export interface TableCell {
    uuid: UUID;
    uuid_attribute: UUID;
    table_row: number;
    table_attribute_reference: UUID;
}

/** What the table helpers read and write of a table. An `AttributeInstance` is one. */
export interface TableInstance<C extends TableCell = TableCell> {
    uuid: UUID;
    table_attributes: C[];
}

/** What the table helpers read of a column. A `ColumnStructure` is one. */
export interface TableColumn {
    attribute: { uuid: UUID };
    sequence: number;
}

function cell_key(row: number, uuid_attribute: UUID): string {
    return `${row}|${uuid_attribute}`;
}

function has_valid_row(cell: TableCell): boolean {
    return Number.isInteger(cell.table_row) && cell.table_row >= 0;
}

function cells_of<C extends TableCell>(table: TableInstance<C>): C[] {
    if (!table.table_attributes) table.table_attributes = [];
    return table.table_attributes;
}

/** Order the cells by row, keeping the order of the cells within a row. */
function sort_by_row(table: TableInstance): void {
    cells_of(table).sort((a, b) => a.table_row - b.table_row);
}

/**
 * @description - The columns in table order.
 * @returns A new array, sorted by `sequence`.
 */
export function table_columns_in_order<T extends TableColumn>(columns: T[]): T[] {
    return [...(columns ?? [])].sort((a, b) => a.sequence - b.sequence);
}

/**
 * @description - The number of rows: one past the highest row a cell is in.
 */
export function table_row_count(table: TableInstance): number {
    let count = 0;
    for (const cell of table.table_attributes ?? []) {
        if (has_valid_row(cell)) count = Math.max(count, cell.table_row + 1);
    }
    return count;
}

/**
 * @description - The table as a grid: one entry per row, each holding the row's cells
 * in column order. A position with no cell is undefined.
 */
export function table_rows<C extends TableCell>(
    table: TableInstance<C>,
    columns: TableColumn[]
): (C | undefined)[][] {
    const cells = new Map<string, C>();
    for (const cell of table.table_attributes ?? []) {
        cells.set(cell_key(cell.table_row, cell.uuid_attribute), cell);
    }
    const ordered = table_columns_in_order(columns);
    const rows: (C | undefined)[][] = [];
    const count = table_row_count(table);
    for (let row = 0; row < count; row++) {
        rows.push(ordered.map((column) => cells.get(cell_key(row, column.attribute.uuid))));
    }
    return rows;
}

/**
 * @description - Add a row made of `cells` at the end of the table. The cells are
 * numbered and pointed at the table here, so the caller only creates them.
 * @returns The index of the new row.
 */
export function add_table_row<C extends TableCell>(table: TableInstance<C>, cells: C[]): number {
    const row = table_row_count(table);
    for (const cell of cells) {
        cell.table_row = row;
        cell.table_attribute_reference = table.uuid;
    }
    cells_of(table).push(...cells);
    return row;
}

/**
 * @description - Put `cell` at a position of the table, for a row that lacks the cell
 * of that column. The cell must already be an instance of the column's attribute.
 */
export function add_table_cell<C extends TableCell>(table: TableInstance<C>, row: number, cell: C): void {
    cell.table_row = row;
    cell.table_attribute_reference = table.uuid;
    cells_of(table).push(cell);
    sort_by_row(table);
}

/**
 * @description - Remove a row, moving every row below it up by one so the rows stay
 * numbered without gaps. The remaining cells are left in row order.
 * @returns The cells that were removed.
 */
export function remove_table_row<C extends TableCell>(table: TableInstance<C>, row: number): C[] {
    const removed: C[] = [];
    const kept: C[] = [];
    for (const cell of cells_of(table)) {
        if (cell.table_row === row) {
            removed.push(cell);
        } else {
            if (cell.table_row > row) cell.table_row -= 1;
            kept.push(cell);
        }
    }
    // In place: callers hold on to the array.
    table.table_attributes.splice(0, table.table_attributes.length, ...kept);
    sort_by_row(table);
    return removed;
}

/**
 * @description - Move the row at `from` to `to`, shifting the rows in between by one,
 * and leave the cells in row order. Out-of-range positions leave the table as it is.
 * @returns Whether anything moved.
 */
export function move_table_row(table: TableInstance, from: number, to: number): boolean {
    const count = table_row_count(table);
    if (from === to || from < 0 || to < 0 || from >= count || to >= count) return false;
    for (const cell of cells_of(table)) {
        const row = cell.table_row;
        if (row === from) cell.table_row = to;
        else if (from < to && row > from && row <= to) cell.table_row = row - 1;
        else if (to < from && row >= to && row < from) cell.table_row = row + 1;
    }
    sort_by_row(table);
    return true;
}

/**
 * @description - The ways the table breaks the rules at the top of this file, each as
 * a sentence. `columns` are the columns of the table's attribute type; a type without
 * columns is not a table, so its instance may hold no cells. Nested tables are not
 * descended into: check each against its own columns.
 * @returns An empty array when the table keeps the rules.
 */
export function table_violations(table: TableInstance, columns: TableColumn[]): string[] {
    const cells = table.table_attributes ?? [];
    if (!columns || columns.length === 0) {
        return cells.length > 0 ? [`it is not a table but holds ${cells.length} cell(s)`] : [];
    }

    const problems: string[] = [];
    const column_uuids = new Set(columns.map((column) => column.attribute.uuid));
    const positions = new Set<string>();
    const rows = new Set<number>();
    for (const cell of cells) {
        if (!has_valid_row(cell)) {
            problems.push(`cell ${cell.uuid} has no valid row: ${cell.table_row}`);
            continue;
        }
        if (!column_uuids.has(cell.uuid_attribute)) {
            problems.push(`cell ${cell.uuid} is not in a column of the table: attribute ${cell.uuid_attribute}`);
        }
        const reference = cell.table_attribute_reference;
        if (reference !== null && reference !== undefined && reference !== table.uuid) {
            problems.push(`cell ${cell.uuid} belongs to another table: ${reference}`);
        }
        const position = cell_key(cell.table_row, cell.uuid_attribute);
        if (positions.has(position)) {
            problems.push(`row ${cell.table_row} holds more than one cell of attribute ${cell.uuid_attribute}`);
        }
        positions.add(position);
        rows.add(cell.table_row);
    }
    const count = table_row_count(table);
    for (let row = 0; row < count; row++) {
        if (!rows.has(row)) problems.push(`row ${row} is missing: rows are numbered from 0 without gaps`);
    }
    return problems;
}
