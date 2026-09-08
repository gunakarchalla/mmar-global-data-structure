import { MetaObject, UUID } from "./Metamodel_metaobjects.structure";
import { Type } from "class-transformer";
export { File };

class File extends MetaObject {
    /**
     * The bytes of the file, typed as the Uint8Array that Buffer extends rather
     * than as Buffer itself: this structure is shared with the browser clients,
     * where Buffer is neither a type nor a value. The server keeps passing real
     * Buffers, which are assignable here. Naming Buffer also made the decorator
     * below a latent ReferenceError, since class-transformer calls the arrow when
     * it revives a File.
     */
    @Type(() => Uint8Array) public data: Uint8Array;
    @Type(() => String) public type: string;

    constructor(uuid: UUID, name: string, data: Uint8Array, type: string) {
        super(uuid, name);
        this.data = data;
        this.type = type;
    }
    get_data() {
        return this.data;
    }
    set_data(data: Uint8Array) {
        this.data = data;
    }
    get_type() {
        return this.type;
    }
    set_type(type: string) {
        this.type = type;
    }
}
