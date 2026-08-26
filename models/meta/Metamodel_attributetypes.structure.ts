import {MetaObject, UUID} from "./Metamodel_metaobjects.structure";
import {Type} from "class-transformer";
import {METAOBJECT_WRITE_FIELDS} from "./Metamodel_metaobjects.structure";
import {WriteSpec} from "../write_difference";
import {Role} from "./Metamodel_roles.structure";
import {ColumnStructure} from "./Metamodel_columns.structure";

export {AttributeType};

class AttributeType extends MetaObject {
    @Type(() => Boolean) public pre_defined: boolean;
    @Type(() => RegExp) public regex_value: RegExp;
    @Type(() => Role) public role: Role;
    @Type(() => ColumnStructure) public has_table_attribute: ColumnStructure[];

    constructor(
        uuid: UUID,
        name: string,
        pre_defined: boolean,
        regex_value: RegExp,
        has_table_attribute?: ColumnStructure[],
        r?: Role
    ) {
        super(uuid, name);
        this.pre_defined = pre_defined;
        this.regex_value = regex_value;
        if (r) {
            this.set_role(r);
        }
        if (has_table_attribute) {
            this.set_has_table_attribute(has_table_attribute);
        } else {
            this.has_table_attribute = new Array<ColumnStructure>();
        }
    }


    set_role(role: Role) {
        this.role = role;
    }

    get_role() {
        return this.role;
    }


    get_pre_defined() {
        return this.pre_defined;
    }

    set_pre_defined(pre_defined: boolean) {
        this.pre_defined = pre_defined;
    }

    get_regex_value() {
        return this.regex_value;
    }

    set_regex_value(regex_value: RegExp) {
        this.regex_value = regex_value;
    }

    set_has_table_attribute(has_table_attribute: any[]) {
        this.has_table_attribute = has_table_attribute;
    }

    get_has_table_attribute() {
        return this.has_table_attribute;
    }

    add_has_table_attribute(has_table_attribute: any) {
        this.has_table_attribute.push(has_table_attribute);
    }

    remove_has_table_attribute(has_table_attribute: any) {
        this.has_table_attribute.splice(
            this.has_table_attribute.indexOf(has_table_attribute),
            1
        );
    }

    get_has_table_attribute_difference(has_table_attribute_to_compare: ColumnStructure[]): {
        added: ColumnStructure[];
        removed: ColumnStructure[];
        modified: ColumnStructure[];
    } {
        const added: ColumnStructure[] = [];
        const removed: ColumnStructure[] = [];
        const modified: ColumnStructure[] = [];

        const current_has_table_attribute = this.get_has_table_attribute();

        const current_has_table_attribute_uuids = current_has_table_attribute.map((attr) => attr.get_attribute().get_uuid());

        const has_table_attribute_to_compare_uuids = has_table_attribute_to_compare.map((attr) => attr.get_attribute().get_uuid());

        for (const col of current_has_table_attribute) {
            const attr_uuid = col.get_attribute().get_uuid();
            if (!has_table_attribute_to_compare_uuids.includes(attr_uuid)) {
                removed.push(col);
            } else {
                const modified_attr = has_table_attribute_to_compare.find((r) => r.get_attribute().get_uuid() === attr_uuid);
                if (modified_attr) modified.push(modified_attr);
            }
        }

        for (const attr of has_table_attribute_to_compare) {
            const attr_uuid = attr.get_attribute().get_uuid();
            if (!current_has_table_attribute_uuids.includes(attr_uuid)) {
                added.push(attr);
            }
        }

        return {added, removed, modified};
    }

    /**
     * @description - Metamodel_attribute_types_connection.update writes metaobject,
     * then update_attributeType, then the role, then the table columns. A column is
     * a ColumnStructure and has no uuid of its own, so the column list is compared
     * whole rather than walked.
     * @returns {WriteSpec} - What a write of this attribute type would put in the
     * database.
     */
    get_write_spec(): WriteSpec {
        return {
            fields: [...METAOBJECT_WRITE_FIELDS, "pre_defined", "regex_value"],
            hard_fields: ["has_table_attribute"],
            children: ["role"],
        };
    }
}
