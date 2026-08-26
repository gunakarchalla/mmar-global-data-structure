import { MetaObject, UUID } from "./Metamodel_metaobjects.structure";
import { Type } from "class-transformer";
import { METAOBJECT_WRITE_FIELDS } from "./Metamodel_metaobjects.structure";
import { WriteSpec } from "../write_difference";

export { Procedure };
class Procedure extends MetaObject {
  @Type(() => String) public definition: string;
  constructor(uuid: UUID, name: string, definition: string) {
    super(uuid, name);
    this.definition = definition;
  }

  get_definition() {
    return this.definition;
  }

  set_definition(definition: string) {
    this.definition = definition;
  }

  /**
   * @description - Metamodel_procedureConnection.update writes metaobject, then
   * the procedure definition. It has no children.
   * @returns {WriteSpec} - What a write of this procedure would put in the
   * database.
   */
  get_write_spec(): WriteSpec {
    return {fields: [...METAOBJECT_WRITE_FIELDS, "definition"]};
  }
}
