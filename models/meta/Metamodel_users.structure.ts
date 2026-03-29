import {MetaObject, UUID} from "./Metamodel_metaobjects.structure";
import {Type} from "class-transformer";
import * as jwt from "jsonwebtoken";
import {Usergroup} from "./Metamodel_usergroups.structure";

export {User};

class User extends MetaObject {
    @Type(() => String) public username: string;
    @Type(() => String) public password: string;
    @Type(() => String) public token: string | undefined;
    @Type(() => Usergroup) public has_user_group: Usergroup[];

    constructor(
        uuid: UUID,
        name: string,
        username: string,
        password: string,
        token?: string,
        has_user_group?: Usergroup[],
    ) {
        super(uuid, name);
        this.username = username;
        this.password = password;
        if (token) this.token = token;
        if (has_user_group) this.has_user_group = has_user_group;
    }

    static get_jwt_secret(): string {
        return process.env.JWT_SECRET as string;
    }

    can_user_create_instance(): boolean {
        return this.has_user_group.some(
            (usergroup) => usergroup.can_create_instance,
        );
    }

    can_user_create_scenetype(): boolean {
        return this.has_user_group.some(
            (usergroup) => usergroup.can_create_scenetype,
        );
    }

    can_user_create_attribute(): boolean {
        return this.has_user_group.some((usergroup) => usergroup.can_create_attribute);
    }

    generate_token(): string {
        const jwt_secret = User.get_jwt_secret();
        this.token = jwt.sign(this.toJsonForToken(), jwt_secret, {
            expiresIn: process.env.TOKEN_EXPIRE_TIME,
        });
        return this.token;
    }

    can_user_create_class(): boolean {
        return this.has_user_group.some((usergroup) => usergroup.can_create_class);
    }

    can_user_create_relationclass(): boolean {
        return this.has_user_group.some((usergroup) => usergroup.can_create_relationclass);
    }

    can_user_create_port(): boolean {
        return this.has_user_group.some((usergroup) => usergroup.can_create_port);
    }

    can_user_create_role(): boolean {
        return this.has_user_group.some((usergroup) => usergroup.can_create_role);
    }

    set_username(login: string) {
        this.username = login;
    }

    get_username() {
        return this.username;
    }

    set_password(password: string) {
        this.password = password;
    }

    get_password() {
        return this.password;
    }

    set_token(token: string) {
        this.token = token;
    }

    get_token() {
        return this.token;
    }

    set_has_user_group(has_user_group: Usergroup[]) {
        this.has_user_group = has_user_group;
    }

    get_has_user_group() {
        return this.has_user_group;
    }

    add_has_user_group(has_user_group: Usergroup) {
        this.has_user_group.push(has_user_group);
    }

    remove_has_user_group_by_uuid(uuid: UUID) {
        this.has_user_group = this.has_user_group.filter(
            (item) => item.uuid !== uuid,
        );
    }

    get_user_group_difference(user_group_to_compare: Usergroup[]) {
        return this.get_collection_difference<Usergroup>(user_group_to_compare, this.has_user_group)
    }

    is_admin(): boolean {
        return (
            this.get_username() == "admin" &&
            this.get_uuid() == "ff892138-77e0-47fe-a323-3fe0e1bf0240"
        );
    }

    private toJsonForToken() {
        return {
            username: this.username,
            uuid: this.get_uuid(),
            isAdmin: this.is_admin(),
        };
    }
}
