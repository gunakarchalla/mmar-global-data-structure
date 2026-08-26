import {UUID} from "../meta/Metamodel_metaobjects.structure";
import {ObjectInstance} from "./instance_objects.structure";
import {Type} from "class-transformer";
import {AttributeInstance} from "./Instance_attributes.structure";
import {INSTANCE_OBJECT_WRITE_FIELDS} from "./instance_objects.structure";
import {WriteSpec} from "../write_difference";

export class PortInstance extends ObjectInstance {
    @Type(() => String) public uuid_port: UUID;
    @Type(() => String) public uuid_class_instance: UUID;
    @Type(() => String) public uuid_scene_instance: UUID;
    @Type(() => AttributeInstance)
    public attribute_instances: AttributeInstance[];

    constructor(
        uuid: UUID,
        uuid_port: UUID,
        uuid_class_instance?: UUID,
        uuid_scene_instance?: UUID,
        attribute_instances?: AttributeInstance[]
    ) {
        super(uuid);
        this.uuid_port = uuid_port;
        if (uuid_class_instance) {
            this.uuid_class_instance = uuid_class_instance;
        }
        if (uuid_scene_instance) {
            this.uuid_scene_instance = uuid_scene_instance;
        }
        if (attribute_instances) {
            this.attribute_instances = attribute_instances;
        } else {
            this.attribute_instances = [];
        }
    }

    get_attribute_instances(): AttributeInstance[] {
        return this.attribute_instances;
    }

    add_attribute_instance(attribute_instance: AttributeInstance): void {
        this.attribute_instances.push(attribute_instance);
    }

    remove_attribute_instance(attribute_instance: AttributeInstance): void {
        const index = this.attribute_instances.indexOf(attribute_instance);
        if (index > -1) {
            this.attribute_instances.splice(index, 1);
        }
    }

    set_attribute_instance(attribute_instance: AttributeInstance[]): void {
        this.attribute_instances = attribute_instance;
    }

    get_uuid_port(): UUID {
        return this.uuid_port;
    }

    set_uuid_port(uuid_port: UUID): void {
        this.uuid_port = uuid_port;
    }

    get_uuid_class_instance(): UUID {
        return this.uuid_class_instance;
    }

    set_uuid_class_instance(uuid_class_instance: UUID): void {
        this.uuid_class_instance = uuid_class_instance;
    }

    get_uuid_scene_instance(): UUID {
        return this.uuid_scene_instance;
    }

    set_uuid_scene_instance(uuid_scene_instance: UUID): void {
        this.uuid_scene_instance = uuid_scene_instance;
    }

    get_attribute_instance_difference(attribute_to_compare: AttributeInstance[]) {
        return this.get_collection_difference<AttributeInstance>(attribute_to_compare, this.attribute_instances);
    }

    /**
     * @description - Instance_port_connection.update writes instance_object, then
     * update_port_instance, then walks the attribute collection.
     * @returns {WriteSpec} - What a write of this port instance would put in the
     * database.
     */
    get_write_spec(): WriteSpec {
        return {
            fields: [
                ...INSTANCE_OBJECT_WRITE_FIELDS,
                "uuid_class_instance",
                "uuid_scene_instance",
            ],
            children: ["attribute_instances"],
        };
    }
}
