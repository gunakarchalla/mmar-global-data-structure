import {UUID} from "../meta/Metamodel_metaobjects.structure";
import {RoleInstance} from "./Instance_roles.structure";
import {ObjectInstance} from "./instance_objects.structure";
import {Type} from "class-transformer";
import {INSTANCE_OBJECT_WRITE_FIELDS} from "./instance_objects.structure";
import {WriteSpec} from "../write_difference";

/**
 * This is the structure of the meta attribute
 */
export class AttributeInstance extends ObjectInstance {
    @Type(() => String) public uuid_attribute: UUID;
    @Type(() => String) public uuid_reference_attribute: UUID;
    @Type(() => Boolean) public is_propagated: boolean;
    @Type(() => String) public value: string;
    @Type(() => String) public assigned_uuid_scene_instance: UUID;
    @Type(() => String) public assigned_uuid_class_instance: UUID;
    @Type(() => String) public assigned_uuid_port_instance: UUID;
    @Type(() => String) public table_attribute_reference: UUID; // if the attribute is a cell of a table
    @Type(() => AttributeInstance) public table_attributes: AttributeInstance[]; // if this the attribute is a table
    @Type(() => Number) public table_row: number;

    //----------------------------------------------------------
    //for reference_attributes -> to decide if called role_instance_from or role_instance
    //----------------------------------------------------------
    @Type(() => RoleInstance) public role_instance_from: RoleInstance;

    constructor(
        uuid: UUID,
        uuid_attribute: UUID,
        assigned_uuid_scene_instance: UUID,
        assigned_uuid_class_instance: UUID,
        instance_value: string,
        assigned_uuid_port_instance?: UUID,
        is_propagated?: boolean,
        uuid_reference_attribute?: UUID,
        table_attributes?: AttributeInstance[],
        table_attribute_reference?: UUID,
        //----------------------------------------------------------
        //added for reference_attributes
        //----------------------------------------------------------
        role_from?: RoleInstance,
    ) {
        super(uuid);
        this.uuid_attribute = uuid_attribute;
        this.assigned_uuid_scene_instance = assigned_uuid_scene_instance;
        this.assigned_uuid_class_instance = assigned_uuid_class_instance;
        this.value = instance_value;
        if (is_propagated) {
            this.is_propagated = is_propagated;
        }
        if (uuid_reference_attribute) {
            this.uuid_reference_attribute = uuid_reference_attribute;
        }
        if (assigned_uuid_port_instance) {
            this.assigned_uuid_port_instance = assigned_uuid_port_instance;
        }
        if (table_attributes) {
            this.table_attributes = table_attributes;
        } else {
            this.table_attributes = [];
        }
        if (table_attribute_reference) {
            this.table_attribute_reference = table_attribute_reference;
        }
        //----------------------------------------------------------
        //added for reference_attributes
        //----------------------------------------------------------
        if (role_from) {
            this.role_instance_from = role_from;
        }
    }

    get_uuid_attribute() {
        return this.uuid_attribute;
    }

    get_uuid_reference_attribute() {
        return this.uuid_reference_attribute;
    }

    get_is_propagated() {
        return this.is_propagated;
    }

    get_value() {
        return this.value;
    }

    get_assigned_uuid_scene_instance() {
        return this.assigned_uuid_scene_instance;
    }

    get_assigned_uuid_class_instance() {
        return this.assigned_uuid_class_instance;
    }

    get_assigned_uuid_port_instance() {
        return this.assigned_uuid_port_instance;
    }

    get_table_attribute_reference() {
        return this.table_attribute_reference;
    }

    get_table_row() {
        return this.table_row;
    }

    get_table_attributes() {
        return this.table_attributes;
    }

    //added for reference_attributes
    get_role_instance_from() {
        return this.role_instance_from;
    }

    set_table_row(table_row: number) {
        this.table_row = table_row;
    }

    set_uui_attribute(uuid_attribute: UUID) {
        this.uuid_attribute = uuid_attribute;
    }

    set_uuid_reference_attribute(uuid_reference_attribute: UUID) {
        this.uuid_reference_attribute = uuid_reference_attribute;
    }

    set_is_propagated(is_propagated: boolean) {
        this.is_propagated = is_propagated;
    }

    set_value(value: string) {
        this.value = value;
    }

    set_assigned_uuid_scene_instance(assigned_uuid_scene_instance: UUID) {
        this.assigned_uuid_scene_instance = assigned_uuid_scene_instance;
    }

    set_assigned_uuid_class_instance(assigned_uuid_class_instance: UUID) {
        this.assigned_uuid_class_instance = assigned_uuid_class_instance;
    }

    set_assigned_uuid_port_instance(assigned_uuid_port_instance: UUID) {
        this.assigned_uuid_port_instance = assigned_uuid_port_instance;
    }

    set_table_attributes(table_attribute: AttributeInstance[]) {
        this.table_attributes = table_attribute;
    }

    set_table_attribute_reference(table_attribute_reference: UUID) {
        this.table_attribute_reference = table_attribute_reference;
    }

    //----------------------------------------------------------
    //added for reference_attributes
    //----------------------------------------------------------
    set_role_instance_from(role_instance_from: RoleInstance) {
        this.role_instance_from = role_instance_from;
    }

    add_table_attributes(table_attributes: AttributeInstance) {
        this.table_attributes.push(table_attributes);
    }

    remove_table_attributes(table_attributes: AttributeInstance) {
        this.table_attributes.splice(
            this.table_attributes.indexOf(table_attributes),
            1
        );
    }

    find_table_attributes(uuid: UUID) {
        return this.table_attributes.find((table_attribute) => {
            return table_attribute.get_uuid() === uuid;
        });
    }

    get_table_attribute_instance_difference(attribute_table_to_compare: AttributeInstance[]): {
        added: AttributeInstance[];
        removed: AttributeInstance[];
        modified: AttributeInstance[];
    } {
        return this.get_collection_difference<AttributeInstance>(attribute_table_to_compare, this.table_attributes);
    }

    /**
     * @description - Instance_attribute_connection.update writes instance_object,
     * then update_attribute_instance, then walks table_attributes. role_instance_from
     * is not a column it writes but a role it posts, so any value there is treated
     * as a change rather than modelled.
     * @returns {WriteSpec} - What a write of this attribute instance would put in
     * the database.
     */
    get_write_spec(): WriteSpec {
        return {
            fields: [
                ...INSTANCE_OBJECT_WRITE_FIELDS,
                "is_propagated",
                "value",
                "assigned_uuid_scene_instance",
                "assigned_uuid_class_instance",
                "assigned_uuid_port_instance",
                "table_attribute_reference",
                "table_row",
            ],
            children: ["table_attributes"],
            opaque: ["role_instance_from"],
        };
    }
}
