import {MetaObject, UUID} from "./Metamodel_metaobjects.structure";
import {Attribute} from "./Metamodel_attributes.structure";
import {Port} from "./Metamodel_ports.structure";
import {Type} from "class-transformer";
import {METAOBJECT_WRITE_FIELDS} from "./Metamodel_metaobjects.structure";
import {WriteSpec} from "../write_difference";

export {Class};

class Class extends MetaObject {
    @Type(() => Boolean) public is_reusable: boolean;
    @Type(() => Boolean) public is_abstract: boolean;
    @Type(() => Attribute) public attributes: Attribute[];
    @Type(() => Port) public ports: Port[];

    constructor(
        uuid: UUID,
        name: string,
        is_reusable: boolean,
        is_abstract: boolean,
        a?: Attribute[],
        p?: Port[]
    ) {
        super(uuid, name);
        this.is_reusable = is_reusable;
        this.is_abstract = is_abstract;
        if (a) {
            this.set_attribute(a);
        } else {
            this.attributes = [];
        }
        if (p) {
            this.set_port(p);
        } else {
            this.ports = [];
        }
    }

    add_attribute(a: Attribute) {
        this.attributes.push(a);
    }

    remove_attribute(uuid: UUID) {
        this.attributes = this.attributes.filter((a) => a.get_uuid() !== uuid);
    }

    set_attribute(a: Attribute[]) {
        this.attributes = a;
    }

    get_attribute() {
        return this.attributes;
    }

    add_port(p: Port) {
        this.ports.push(p);
    }

    remove_port(uuid: UUID) {
        this.ports = this.ports.filter((p) => p.get_uuid() !== uuid);
    }

    set_port(p: Port[]) {
        this.ports = p;
    }

    get_port() {
        return this.ports;
    }

    get_is_reusable() {
        return this.is_reusable;
    }

    get_is_abstract() {
        return this.is_abstract;
    }

    set_is_reusable(is_reusable: boolean) {
        this.is_reusable = is_reusable;
    }

    set_is_abstract(is_abstract: boolean) {
        this.is_abstract = is_abstract;
    }

    get_attributes_difference(attribute_to_compare: Attribute[]): {
        added: Attribute[];
        removed: Attribute[];
        modified: Attribute[];
    } {
        return this.get_collection_difference<Attribute>(attribute_to_compare, this.get_attribute());
    }

    get_ports_difference(port_to_compare: Port[]): {
        added: Port[];
        removed: Port[];
        modified: Port[];
    } {
        const test = this.get_collection_difference<Port>(port_to_compare, this.get_port());
        return test
    }

    set_allArrays(a?: Attribute[], p?: Port[]) {
        //this way of doing it is dynamical and could extend easily
        if (a) {
            this.set_attribute(a);
        }
        if (p) {
            this.set_port(p);
        }
    }

    /**
     * @description - Metamodel_classes_connection.update writes metaobject, then
     * update_class, then walks the attribute and port collections.
     * @returns {WriteSpec} - What a write of this class would put in the database.
     */
    get_write_spec(): WriteSpec {
        return {
            fields: [...METAOBJECT_WRITE_FIELDS, "is_abstract", "is_reusable"],
            children: ["attributes", "ports"],
        };
    }
}
