import { UUID } from "../meta/Metamodel_metaobjects.structure";
import { ObjectInstance } from "./instance_objects.structure";
import { Type } from "class-transformer";
import { INSTANCE_OBJECT_WRITE_FIELDS } from "./instance_objects.structure";
import { WriteSpec } from "../write_difference";

export class RoleInstance extends ObjectInstance {
  @Type(() => String) public uuid_role: UUID;
  @Type(() => String) public uuid_relationclass: UUID;
  @Type(() => String) public uuid_attribute_instance: UUID;
  @Type(() => String) public uuid_has_reference_class_instance: UUID;
  @Type(() => String) public uuid_has_reference_port_instance: UUID;
  @Type(() => String) public uuid_has_reference_scene_instance: UUID;
  @Type(() => String) public uuid_has_reference_attribute_instance: UUID;
  @Type(() => String) public uuid_has_reference_relationclass_instance: UUID;

  constructor(
    uuid: UUID,
    uuidRole: UUID,
    uuidRelationClass?: UUID,
    uuidAttributeInstance?: UUID,
    uuidReferenceClassInstance?: UUID,
    uuidReferencePortInstance?: UUID,
    uuidReferenceSceneInstance?: UUID,
    uuidReferenceAttributeInstance?: UUID,
    uuidReferenceRelationClassInstance?: UUID
  ) {
    super(uuid);
    this.uuid_role = uuidRole;

    if (uuidRelationClass) {
      this.uuid_relationclass = uuidRelationClass;
    }
    if (uuidAttributeInstance) {
      this.uuid_attribute_instance = uuidAttributeInstance;
    }
    if (uuidReferenceClassInstance) {
      this.uuid_has_reference_class_instance = uuidReferenceClassInstance;
    }
    if (uuidReferencePortInstance) {
      this.uuid_has_reference_port_instance = uuidReferencePortInstance;
    }
    if (uuidReferenceSceneInstance) {
      this.uuid_has_reference_scene_instance = uuidReferenceSceneInstance;
    }
    if (uuidReferenceAttributeInstance) {
      this.uuid_has_reference_attribute_instance =
        uuidReferenceAttributeInstance;
    }
    if (uuidReferenceRelationClassInstance) {
      this.uuid_has_reference_relationclass_instance =
        uuidReferenceRelationClassInstance;
    }
  }

  /**
   * @description - Instance_role_connection.update writes instance_object, then
   * update_role_instance. It has no children.
   * @returns {WriteSpec} - What a write of this role instance would put in the
   * database.
   */
  get_write_spec(): WriteSpec {
    return {
      fields: [
        ...INSTANCE_OBJECT_WRITE_FIELDS,
        "uuid_has_reference_class_instance",
        "uuid_has_reference_port_instance",
        "uuid_has_reference_scene_instance",
        "uuid_has_reference_attribute_instance",
        "uuid_has_reference_relationclass_instance",
      ],
    };
  }
}
