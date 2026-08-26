import { UUID } from "./Metamodel_metaobjects.structure";
import { Class } from "./Metamodel_classes.structure";
import { Type } from "class-transformer";
import { WriteSpec } from "../write_difference";
import { Role } from "./Metamodel_roles.structure";

export { Relationclass };

class Relationclass extends Class {
  @Type(() => Role) public role_from: Role;
  @Type(() => Role) public role_to: Role;
  @Type(() => String) public bendpoint: UUID; //uuid of the bendpoint class

  //fully specified or minimal
  constructor(
    uuid: UUID,
    name: string,
    is_reusable: boolean,
    is_abstract: boolean,
    roleFrom: Role,
    roleTo: Role,
    bendpoint?: UUID
  ) {
    super(uuid, name, is_reusable, is_abstract);
    this.role_from = roleFrom;
    this.role_to = roleTo;
    if (bendpoint) {
      this.set_bendpoint(bendpoint);
    }
  }

  get_role_from(): Role {
    return this.role_from;
  }

  set_role_from(value: Role) {
    this.role_from = value;
  }

  get_role_to(): Role {
    return this.role_to;
  }

  set_role_to(value: Role) {
    this.role_to = value;
  }

  set_bendpoint(r: UUID | undefined) {
    if (r !== undefined) {
      this.bendpoint = r;
    }
  }

  get_bendpoint() {
    return this.bendpoint;
  }

  /**
   * @description - Metamodel_relationclasses_connection.update runs the whole
   * class update first, then writes the relationclass row and both roles. The
   * bendpoint is written twice, once without coalesce, so a null bendpoint
   * overwrites what is stored.
   * @returns {WriteSpec} - What a write of this relationclass would put in the
   * database.
   */
  get_write_spec(): WriteSpec {
    const as_class = super.get_write_spec();
    return {
      fields: [...(as_class.fields ?? []), "role_from.uuid", "role_to.uuid"],
      hard_fields: ["bendpoint"],
      children: [...(as_class.children ?? []), "role_from", "role_to"],
    };
  }
}
