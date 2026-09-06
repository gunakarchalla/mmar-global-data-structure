import {Expose, plainToInstance, Transform, Type} from "class-transformer";
import {WriteSpec, write_would_change} from "../write_difference";

export type UUID = string;

//export type Point2D = {x:number, y:number, z:number};

export class Point2D {
    @Type(() => Number)
    x: number;
    @Type(() => Number)
    y: number;
    @Type(() => Number)
    z: number;
}

export class Point3D {
    @Type(() => Number)
    x: number;
    @Type(() => Number)
    y: number;
    @Type(() => Number)
    z: number;
}

export class Quaternion {
    @Type(() => Number)
    x: number;
    @Type(() => Number)
    y: number;
    @Type(() => Number)
    z: number;
    @Type(() => Number)
    w: number;
}

//export type Point3D = {x:number, y:number, z:number};

/**
 * @description - The columns of metaobject that update_metaObject writes, all of
 * them as coalesce($n, column). Note that rotation is not among them, although
 * the class carries one.
 */
export const METAOBJECT_WRITE_FIELDS = [
    "name",
    "description",
    "geometry",
    "coordinates_2d",
    "relative_coordinate_3d",
    "absolute_coordinate_3d",
];

class MetaObject {
    @Type(() => String) public uuid: UUID;
    @Type(() => String) public name: string;

    @Type(() => Function)
    public geometry: Function;

    @Type(() => String)
    public description: string;

    @Type(() => Point2D)
    @Transform(
        ({value}) => (typeof value == "string" ? JSON.parse(value) : value),
        {toClassOnly: true}
    ) //convert the plain text to proper json
    public coordinates_2d: Point2D;

    @Type(() => Point3D)
    @Transform(
        ({value}) => (typeof value == "string" ? JSON.parse(value) : value),
        {toClassOnly: true}
    ) //convert the plain text to proper json
    public relative_coordinate_3d: Point3D;

    @Type(() => Point3D)
    @Transform(
        ({value}) => (typeof value == "string" ? JSON.parse(value) : value),
        {toClassOnly: true}
    ) //convert the plain text to proper json
    public absolute_coordinate_3d: Point3D;

    @Type(() => Quaternion)
    @Transform(
        ({value}) => (typeof value == "string" ? JSON.parse(value) : value),
        {toClassOnly: true}
    ) //convert the plain text to proper json
    public rotation: Quaternion;

    constructor(
        uuid: UUID,
        name: string,
        description?: string,
        geometry?: Function,
        coordinates_2d?: Point3D,
        relative_coordinate_3d?: Point3D,
        absolute_coordinate_3d?: Point3D,
        rotation?: Quaternion
    ) {
        this.uuid = uuid;
        this.name = name;
        if (geometry) {
            this.set_geometry(geometry);
        }
        if (description) {
            this.set_description(description);
        }
        if (coordinates_2d) {
            this.set_coordinates_2d(coordinates_2d);
        }
        if (relative_coordinate_3d) {
            this.set_relative_coordinate_3d(relative_coordinate_3d);
        }
        if (absolute_coordinate_3d) {
            this.set_absolute_coordinate_3d(absolute_coordinate_3d);
        }
        if (rotation) {
            this.set_rotation(rotation);
        } else {
            this.set_rotation({x: 0, y: 0, z: 0, w: 1});
        }
    }

    @Expose()
    static fromJS(returnObject: unknown) {
        return plainToInstance(this, returnObject);
    }

    get_uuid(): UUID {
        return this.uuid;
    }

    set_uuid(uuid: UUID) {
        this.uuid = uuid;
    }

    set_name(name: string) {
        this.name = name;
    }

    get_name(): string {
        return this.name;
    }

    set_geometry(geometry: Function) {
        this.geometry = geometry;
    }

    set_description(description: string) {
        this.description = description;
    }

    set_coordinates_2d(coordinates_2d: Point3D) {
        this.coordinates_2d = coordinates_2d;
    }

    set_relative_coordinate_3d(relative_coordinate_3d: Point3D) {
        this.relative_coordinate_3d = relative_coordinate_3d;
    }

    set_absolute_coordinate_3d(absolute_coordinate_3d: Point3D) {
        this.absolute_coordinate_3d = absolute_coordinate_3d;
    }

    set_rotation(rotation: Quaternion) {
        this.rotation = rotation;
    }

    set_allAttributes(
        description: string,
        geometry: any,
        coordinates_2d: Point3D,
        relative_coordinate_3d: Point3D,
        absolute_coordinate_3d: Point3D,
        rotation: Quaternion
    ) {
        this.set_geometry(geometry);
        this.set_description(description);
        this.set_coordinates_2d(coordinates_2d);
        this.set_relative_coordinate_3d(relative_coordinate_3d);
        this.set_absolute_coordinate_3d(absolute_coordinate_3d);
        this.set_rotation(rotation);
    }

    set_allAttributes_obj(object: MetaObject) {
        this.set_geometry(object.geometry);
        this.set_description(object.description);
        this.set_coordinates_2d(object.coordinates_2d);
        this.set_relative_coordinate_3d(object.relative_coordinate_3d);
        this.set_absolute_coordinate_3d(object.absolute_coordinate_3d);
        this.set_rotation(object.rotation);
    }

    /**
     * @description - What a write of this object puts in the database. The base
     * class does not describe itself, so a bare MetaObject is always reported as
     * modified; the concrete classes override this.
     * @returns {WriteSpec | null} - The specification, or null when the write is
     * not modelled and the object must always be written.
     */
    get_write_spec(): WriteSpec | null {
        return null;
    }

    /**
     * @description - Compare an incoming collection against the stored one and
     * report what has to be created, deleted and written.
     *
     * Indexed by uuid on both sides rather than scanned: the previous version ran
     * Array.includes over one collection and Array.find over the other from inside
     * a loop, which is quadratic in the size of the metamodel.
     *
     * `modified` holds the objects present on both sides that a write would
     * actually change; it used to hold every object present on both sides,
     * without comparing a field. A class that does not describe its write in
     * get_write_spec is still always reported, so an unmodelled write path is
     * never skipped.
     * @param {T[]} collection_to_compare - The incoming collection.
     * @param {T[]} current_collection - The collection as currently stored.
     * @returns {{added: T[], removed: T[], modified: T[]}} - The difference.
     */
    get_collection_difference<T extends MetaObject>(collection_to_compare: T[], current_collection: T[]):
        {
            added: T[];
            removed: T[];
            modified: T[];
        } {
        const added: T[] = [];
        const removed: T[] = [];
        const modified: T[] = [];

        if (typeof collection_to_compare === "undefined") return {added, removed, modified};

        // The first occurrence of a uuid wins, which is what Array.find returned.
        const incoming_by_uuid = new Map<UUID, T>();
        for (const T of collection_to_compare) {
            if (!incoming_by_uuid.has(T.get_uuid())) {
                incoming_by_uuid.set(T.get_uuid(), T);
            }
        }
        const current_uuids = new Set<UUID>(
            current_collection.map((a) => a.get_uuid())
        );

        for (const T of current_collection) {
            const incoming = incoming_by_uuid.get(T.get_uuid());
            if (incoming === undefined) {
                removed.push(T);
            } else if (write_would_change(incoming, T)) {
                modified.push(incoming);
            }
        }

        for (const T of collection_to_compare) {
            if (!current_uuids.has(T.get_uuid())) {
                added.push(T);
            }
        }

        return {added, removed, modified};
    }
}

export {MetaObject};
