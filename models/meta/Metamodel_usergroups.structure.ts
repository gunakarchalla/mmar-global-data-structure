import {MetaObject, UUID} from "./Metamodel_metaobjects.structure";
import {Type} from "class-transformer";

export {Usergroup};

class Usergroup extends MetaObject {
    @Type(() => MetaObject) public read_right: UUID[];
    @Type(() => MetaObject) public write_right: UUID[];
    @Type(() => MetaObject) public delete_right: UUID[];
    @Type(() => MetaObject) public can_create_instance: UUID[]; // list of meta objects uuids that can create instances of this meta object
    @Type(() => MetaObject) public can_create_scenetype: boolean;
    @Type(() => MetaObject) public can_create_attribute: boolean; // list of parent uuid
    @Type(() => MetaObject) public can_create_attribute_type: boolean; // list of parent uuid
    @Type(() => MetaObject) public can_create_class: boolean; // list of parent uuid
    @Type(() => MetaObject) public can_create_relationclass: boolean; // list of parent uuid
    @Type(() => MetaObject) public can_create_port: boolean; // list of parent uuid
    @Type(() => MetaObject) public can_create_role: boolean; // list of parent uuid
    @Type(() => MetaObject) public can_create_procedure: boolean; // list of parent uuid
    @Type(() => MetaObject) public can_create_user_group: boolean; // list of parent uuid

    constructor(
        uuid: UUID,
        name: string,
        description?: string,
        read_right?: UUID[],
        write_right?: UUID[],
        delete_right?: UUID[],
        can_create_instance?: UUID[],
        can_create_scenetype?: boolean,
        can_create_attribute?: boolean,
        can_create_attribute_type?: boolean,
        can_create_class?: boolean,
        can_create_relationclass?: boolean,
        can_create_port?: boolean,
        can_create_role?: boolean,
        can_create_procedure?: boolean,
        can_create_user_group?: boolean
    ) {
        super(uuid, name, description);
        this.read_right = read_right || [];
        this.write_right = write_right || [];
        this.delete_right = delete_right || [];
        this.can_create_instance = can_create_instance || [];
        this.can_create_scenetype = can_create_scenetype || false;
        this.can_create_attribute = can_create_attribute || false;
        this.can_create_attribute_type = can_create_attribute_type || false;
        this.can_create_class = can_create_class || false;
        this.can_create_relationclass = can_create_relationclass || false;
        this.can_create_port = can_create_port || false;
        this.can_create_role = can_create_role || false;
        this.can_create_procedure = can_create_procedure || false;
        this.can_create_user_group = can_create_user_group || false;
    }

    get_read_right(): UUID[] {
        return this.read_right;
    }

    set_read_right(read_right: UUID[]): void {
        this.read_right = read_right;
    }

    add_read_right(read_right: UUID): void {
        this.read_right.push(read_right);
    }

    remove_read_right(read_right: UUID): void {
        this.read_right = this.read_right.filter((right) => right !== read_right);
    }

    get_write_right(): UUID[] {
        return this.write_right;
    }

    set_write_right(write_right: UUID[]): void {
        this.write_right = write_right;
    }

    add_write_right(write_right: UUID): void {
        this.write_right.push(write_right);
    }

    remove_write_right(write_right: UUID): void {
        this.write_right = this.write_right.filter(
            (right) => right !== write_right
        );
    }

    get_delete_right(): UUID[] {
        return this.delete_right;
    }

    set_delete_right(delete_right: UUID[]): void {
        this.delete_right = delete_right;
    }

    add_delete_right(delete_right: UUID): void {
        this.delete_right.push(delete_right);
    }

    remove_delete_right(delete_right: UUID): void {
        this.delete_right = this.delete_right.filter(
            (right) => right !== delete_right
        );
    }

    get_can_create_instance(): UUID[] {
        return this.can_create_instance;
    }

    set_can_create_instance(can_create_instance: UUID[]): void {
        this.can_create_instance = can_create_instance;
    }

    add_can_create_instance(can_create_instance: UUID): void {
        this.can_create_instance.push(can_create_instance);
    }

    remove_can_create_instance(can_create_instance: UUID): void {
        this.can_create_instance = this.can_create_instance.filter(
            (right) => right !== can_create_instance
        );
    }

    get_can_create_scenetype(): boolean {
        return this.can_create_scenetype;
    }

    set_can_create_scenetype(can_create_scenetype: boolean): void {
        this.can_create_scenetype = can_create_scenetype;
    }

    get_can_create_attribute(): boolean {
        return this.can_create_attribute;
    }

    set_can_create_attribute(can_create_attribute: boolean): void {
        this.can_create_attribute = can_create_attribute;
    }

    remove_can_create_attribute(): void {
        this.can_create_attribute = false;
    }

    get_can_create_attribute_type(): boolean {
        return this.can_create_attribute_type;
    }

    set_can_create_attribute_type(can_create_attribute_type: boolean): void {
        this.can_create_attribute_type = can_create_attribute_type;
    }

    remove_can_create_attribute_type(): void {
        this.can_create_attribute_type = false;
    }

    get_can_create_class(): boolean {
        return this.can_create_class;
    }

    set_can_create_class(can_create_class: boolean): void {
        this.can_create_class = can_create_class;
    }

    remove_can_create_class(): void {
        this.can_create_class = false;
    }

    get_can_create_relationclass(): boolean {
        return this.can_create_relationclass;
    }

    set_can_create_relationclass(can_create_relationclass: boolean): void {
        this.can_create_relationclass = can_create_relationclass;
    }

    remove_can_create_relationclass(): void {
        this.can_create_relationclass = false;
    }

    get_can_create_port(): boolean {
        return this.can_create_port;
    }

    set_can_create_port(can_create_port: boolean): void {
        this.can_create_port = can_create_port;
    }

    remove_can_create_port(): void {
        this.can_create_port = false;
    }

    get_can_create_role(): boolean {
        return this.can_create_role;
    }

    set_can_create_role(can_create_role: boolean): void {
        this.can_create_role = can_create_role;
    }

    remove_can_create_role(): void {
        this.can_create_role = false;
    }

    get_can_create_procedure(): boolean {
        return this.can_create_procedure;
    }

    set_can_create_procedure(can_create_procedure: boolean): void {
        this.can_create_procedure = can_create_procedure;
    }

    remove_can_create_procedure(): void {
        this.can_create_procedure = false;
    }

    get_can_create_user_group(): boolean {
        return this.can_create_user_group;
    }

    set_can_create_user_group(can_create_user_group: boolean): void {
        this.can_create_user_group = can_create_user_group;
    }

    remove_can_create_user_group(): void {
        this.can_create_user_group = false;
    }

    get_read_right_difference(read_rights_to_compare: UUID[]):
        { added: UUID[], removed: UUID[], modified: UUID[] } {
        return this.get_right_difference(read_rights_to_compare, this.read_right);
    }

    get_write_right_difference(write_rights_to_compare: UUID[]):
        { added: UUID[], removed: UUID[], modified: UUID[] } {
        return this.get_right_difference(write_rights_to_compare, this.write_right);
    }

    get_delete_right_difference(delete_rights_to_compare: UUID[]):
        { added: UUID[], removed: UUID[], modified: UUID[] } {
        return this.get_right_difference(delete_rights_to_compare, this.delete_right);
    }

    get_can_create_instance_difference(can_create_instance_to_compare: UUID[]):
        { added: UUID[], removed: UUID[], modified: UUID[] } {
        return this.get_right_difference(can_create_instance_to_compare, this.can_create_instance);
    }

    private get_right_difference(right_to_compare: UUID[], current_right: UUID[]): {
        added: UUID[],
        removed: UUID[],
        modified: UUID[]
    } {
        const added: UUID[] = [];
        const removed: UUID[] = [];
        const modified: UUID[] = [];

        const current_right_uuids = current_right.map((a) => a);
        const right_to_compare_uuids = right_to_compare.map((a) => a);

        for (const p of current_right) {
            const uuid = p;
            if (!right_to_compare_uuids.includes(uuid)) {
                removed.push(p);
            } else {
                const modified_right = right_to_compare.find(
                    (a) => a === uuid
                );
                if (modified_right) modified.push(modified_right);
            }
        }

        for (const p of right_to_compare) {
            const uuid = p;
            if (!current_right_uuids.includes(uuid)) {
                added.push(p);
            }
        }

        return {added, removed, modified};
    }

}
