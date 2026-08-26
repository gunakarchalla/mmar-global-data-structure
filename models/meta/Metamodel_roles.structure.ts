import { MetaObject, UUID } from "./Metamodel_metaobjects.structure";
import {
  AttributeReference,
  ClassReference,
  PortReference,
  RelationClassReference,
  SceneTypeReference,
} from "./Metamodel_references.structure";
import { Type } from "class-transformer";
import { METAOBJECT_WRITE_FIELDS } from "./Metamodel_metaobjects.structure";
import { WriteSpec } from "../write_difference";
import {Class} from "./Metamodel_classes.structure";

export class Role extends MetaObject {
  @Type(() => ClassReference) public class_references: ClassReference[];
  @Type(() => RelationClassReference)
  public relationclass_references: RelationClassReference[];
  @Type(() => SceneTypeReference)
  public scenetype_references: SceneTypeReference[];
  @Type(() => PortReference) public port_references: PortReference[];
  @Type(() => AttributeReference)
  public attribute_references: AttributeReference[];

  //fully defined or minimal
  constructor(
    uuid: UUID,
    name: string,
    cr?: ClassReference[],
    rr?: RelationClassReference[],
    sr?: SceneTypeReference[],
    pr?: PortReference[],
    ar?: AttributeReference[]
  ) {
    super(uuid, name);
    if (cr) {
      this.set_class_reference(cr);
    } else {
      this.class_references = [];
    }
    if (rr) {
      this.set_relationclass_reference(rr);
    } else {
      this.relationclass_references = [];
    }
    if (sr) {
      this.set_scenetype_reference(sr);
    } else {
      this.scenetype_references = [];
    }
    if (pr) {
      this.set_port_reference(pr);
    } else {
      this.port_references = [];
    }
    if (ar) {
      this.set_attribute_reference(ar);
    } else {
      this.attribute_references = [];
    }
  }

  get_reference_difference<T extends ClassReference
      | RelationClassReference
      | PortReference
      | SceneTypeReference
      | AttributeReference>
  (fn_get_references:() => T[] , reference_to_compare: T[]): {
    added: T[];
    removed: T[];
    modified: T[];
  } {
    const added: T[] = [];
    const removed: T[] = [];
    const modified: T[] = [];
    const current_reference = fn_get_references();
    const current_uuids = current_reference.map((c) => c.get_uuid());
    const reference_to_compare_uuid = reference_to_compare.map((c) =>
        c.get_uuid()
    );

    for (const c of current_reference) {
      const uuid = c.get_uuid();
      if (!reference_to_compare_uuid.includes(uuid)) {
        removed.push(c);
      } else {
        const modified_reference = reference_to_compare.find((rc) => rc.get_uuid() === uuid);
        if(modified_reference) modified.push(modified_reference);
      }
    }

    for (const c of reference_to_compare) {
      if (!current_uuids.includes(c.get_uuid())) {
        added.push(c);
      }
    }


    return { added, removed, modified };
  }

  add_class_reference(cr: ClassReference) {
    this.class_references.push(cr);
  }
  remove_class_reference(uuid: UUID) {
    this.class_references = this.class_references.filter((cr) => cr.uuid !== uuid);
  }

  set_class_reference(cr: ClassReference[]) {
    this.class_references = cr;
  }
  get_class_reference() {
    return this.class_references;
  }
  get_class_reference_difference(class_to_compare: ClassReference[]): {
    added: ClassReference[];
    removed: ClassReference[];
    modified: ClassReference[];
  } {
    return this.get_reference_difference(() => this.class_references, class_to_compare);
  }


  add_relationclass_reference(rr: RelationClassReference) {
    this.relationclass_references.push(rr);
  }
    remove_relationclass_reference(uuid: UUID) {
        this.relationclass_references = this.relationclass_references.filter(
        (rr) => rr.uuid !== uuid
        );
    }
  set_relationclass_reference(rr: RelationClassReference[]) {
    this.relationclass_references = rr;
  }
  get_relationclass_reference() {
    return this.relationclass_references;
  }
    get_relationclass_reference_difference(relationclass_to_compare: RelationClassReference[]): {
        added: RelationClassReference[];
        removed: RelationClassReference[];
        modified: RelationClassReference[];
    } {
        return this.get_reference_difference(() => this.relationclass_references, relationclass_to_compare);
    }

  add_scenetype_reference(sr: SceneTypeReference) {
    this.scenetype_references.push(sr);
  }
    remove_scenetype_reference(uuid: UUID) {
        this.scenetype_references = this.scenetype_references.filter(
        (sr) => sr.uuid !== uuid
        );
    }
  set_scenetype_reference(sr: SceneTypeReference[]) {
    this.scenetype_references = sr;
  }
  get_scenetype_reference() {
    return this.scenetype_references;
  }
    get_scenetype_reference_difference(scenetype_to_compare: SceneTypeReference[]): {
        added: SceneTypeReference[];
        removed: SceneTypeReference[];
        modified: SceneTypeReference[];
    } {
        return this.get_reference_difference(() => this.scenetype_references, scenetype_to_compare);
    }

  add_port_reference(pr: PortReference) {
    this.port_references.push(pr);
  }
    remove_port_reference(uuid: UUID) {
        this.port_references = this.port_references.filter(
        (pr) => pr.uuid !== uuid
        );
    }
  set_port_reference(pr: PortReference[]) {
    this.port_references = pr;
  }
  get_port_reference() {
    return this.port_references;
  }
    get_port_reference_difference(port_to_compare: PortReference[]): {
        added: PortReference[];
        removed: PortReference[];
        modified: PortReference[];
    } {
        return this.get_reference_difference(() => this.port_references, port_to_compare);
    }

  add_attribute_reference(ar: AttributeReference) {
    this.attribute_references.push(ar);
  }
    remove_attribute_reference(uuid: UUID) {
        this.attribute_references = this.attribute_references.filter(
        (ar) => ar.uuid !== uuid
        );
    }
  set_attribute_reference(ar: AttributeReference[]) {
    this.attribute_references = ar;
  }

  get_attribute_reference() {
    return this.attribute_references;
  }
    get_attribute_reference_difference(attribute_to_compare: AttributeReference[]): {
        added: AttributeReference[];
        removed: AttributeReference[];
        modified: AttributeReference[];
    } {
        return this.get_reference_difference(() => this.attribute_references, attribute_to_compare);
    }

  //might be useful at some point
  set_allArrays(
    cr?: ClassReference[],
    rr?: RelationClassReference[],
    sr?: SceneTypeReference[],
    pr?: PortReference[]
  ) {
    if (cr) {
      this.set_class_reference(cr);
    }
    if (rr) {
      this.set_relationclass_reference(rr);
    }
    if (sr) {
      this.set_scenetype_reference(sr);
    }
    if (pr) {
      this.set_port_reference(pr);
    }
  }

  /**
   * @description - Metamodel_roles_connection.update writes metaobject, then
   * upserts every reference it is given with min and max. A reference is not a
   * MetaObject, so each list is compared whole rather than walked: the upsert
   * writes back what is already stored when they match.
   * @returns {WriteSpec} - What a write of this role would put in the database.
   */
  get_write_spec(): WriteSpec {
    return {
      fields: [...METAOBJECT_WRITE_FIELDS],
      hard_fields: [
        "class_references",
        "relationclass_references",
        "scenetype_references",
        "port_references",
        "attribute_references",
      ],
    };
  }
}
