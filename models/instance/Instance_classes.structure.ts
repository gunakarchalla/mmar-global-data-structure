import {UUID} from "../meta/Metamodel_metaobjects.structure";
import {ObjectInstance} from "./instance_objects.structure";
import {PortInstance} from "./Instance_ports.structure";
import {Type} from "class-transformer";
import {AttributeInstance} from "./Instance_attributes.structure";
import {INSTANCE_OBJECT_WRITE_FIELDS} from "./instance_objects.structure";
import {WriteSpec} from "../write_difference";

export class ClassInstance extends ObjectInstance {
    @Type(() => String) public uuid_class: UUID;
    @Type(() => String) public uuid_relationclass: UUID;
    @Type(() => String) public uuid_decomposable_class: UUID;
    @Type(() => String) public uuid_aggregator_class: UUID;
    @Type(() => AttributeInstance) public attribute_instance: AttributeInstance[];
    @Type(() => PortInstance) public port_instance: PortInstance[];
    @Type(() => String) public uuid_scene_decomposition_reference: UUID[]; //added by @fabian --> x, y and z for the real world
    @Type(() => String) public uuid_relationclass_bendpoint: UUID;

    // eslint-disable-next-line @typescript-eslint/ban-types
    constructor(
        uuid: UUID,
        uuidClass: UUID,
        uuidRelationclass?: UUID,
        uuidDecomposableClass?: UUID,
        uuidAggregatorClass?: UUID,
        uuidAttributeInstances?: AttributeInstance[],
        uuidPortInstances?: PortInstance[],
        uuidSceneDecompositionReference?: UUID[],
        uuidRelationclassBendpoint?: UUID
    ) {
        super(uuid);
        this.uuid_class = uuidClass;

        if (uuidRelationclass) {
            this.uuid_relationclass = uuidRelationclass;
        }

        if (uuidDecomposableClass) {
            this.uuid_decomposable_class = uuidDecomposableClass;
        }
        if (uuidAggregatorClass) {
            this.uuid_aggregator_class = uuidAggregatorClass;
        }
        if (uuidAttributeInstances) {
            this.attribute_instance = uuidAttributeInstances;
        } else {
            this.attribute_instance = [];
        }
        if (uuidPortInstances) {
            this.port_instance = uuidPortInstances;
        }
        //if not provided init array
        else {
            this.port_instance = [];
        }
        if (uuidSceneDecompositionReference) {
            this.uuid_scene_decomposition_reference = uuidSceneDecompositionReference;
        }

        if (uuidRelationclassBendpoint) {
            this.uuid_relationclass_bendpoint = uuidRelationclassBendpoint;
        }
    }

    get_attribute_instances(): AttributeInstance[] {
        return this.attribute_instance;
    }

    get_port_instances(): PortInstance[] {
        return this.port_instance;
    }

    get_class_uuid(): UUID {
        return this.uuid_class;
    }

    get_relationclass_uuid(): UUID | undefined {
        return this.uuid_relationclass;
    }

    get_decomposable_class_uuid(): UUID | undefined {
        return this.uuid_decomposable_class;
    }

    get_aggregator_class_uuid(): UUID | undefined {
        return this.uuid_aggregator_class;
    }

    get_scene_decomposition_reference_uuids(): UUID[] | undefined {
        return this.uuid_scene_decomposition_reference;
    }

    get_relationclass_bendpoint_uuid(): UUID | undefined {
        return this.uuid_relationclass_bendpoint;
    }

    set_attribute_instances(attribute_instances: AttributeInstance[]): void {
        this.attribute_instance = attribute_instances;
    }

    set_port_instances(port_instances: PortInstance[]): void {
        this.port_instance = port_instances;
    }

    add_attribute_instance(attribute_instance: AttributeInstance): void {
        this.attribute_instance.push(attribute_instance);
    }

    add_port_instance(port_instance: PortInstance): void {
        this.port_instance.push(port_instance);
    }

    remove_attribute_instance_by_uuid(uuid: UUID): void {
        this.attribute_instance = this.attribute_instance.filter(
            (attribute_instance) => attribute_instance.get_uuid() !== uuid
        );
    }

    remove_port_instance_by_uuid(uuid: UUID): void {
        this.port_instance = this.port_instance.filter(
            (port_instance) => port_instance.get_uuid() !== uuid
        );
    }

    get_attribute_instance_difference(attribute_instance_to_compare: AttributeInstance[]): {
        added: AttributeInstance[];
        removed: AttributeInstance[];
        modified: AttributeInstance[];
    } {
        return this.get_collection_difference<AttributeInstance>(attribute_instance_to_compare, this.attribute_instance);
    }

    get_port_instance_difference(port_instance_to_compare: PortInstance[]): {
        added: PortInstance[];
        removed: PortInstance[];
        modified: PortInstance[];
    } {
        return this.get_collection_difference<PortInstance>(port_instance_to_compare, this.port_instance);
    }



    /**
     * @description - Instance_class_connection.update writes instance_object, then
     * update_class_instance, then walks the attribute and port collections. A class
     * instance whose own columns are untouched but whose attribute changed must
     * still be written, which is why the children are part of the comparison.
     * @returns {WriteSpec} - What a write of this class instance would put in the
     * database.
     */
    get_write_spec(): WriteSpec {
        return {
            fields: [
                ...INSTANCE_OBJECT_WRITE_FIELDS,
                "uuid_relationclass",
                "uuid_decomposable_class",
                "uuid_aggregator_class",
                "uuid_relationclass_bendpoint",
            ],
            children: ["attribute_instance", "port_instance"],
        };
    }
}
