import { HydratedDocument, Types } from 'mongoose';
export type AttachmentDocument = HydratedDocument<Attachment>;
export declare class Attachment {
    filename: string;
    mimetype: string;
    size: number;
    taskId: Types.ObjectId;
    uploadedBy: Types.ObjectId;
    createdAt: Date;
}
export declare const AttachmentSchema: import("mongoose").Schema<Attachment, import("mongoose").Model<Attachment, any, any, any, any, any, Attachment>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Attachment, import("mongoose").Document<unknown, {}, Attachment, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Attachment & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    filename?: import("mongoose").SchemaDefinitionProperty<string, Attachment, import("mongoose").Document<unknown, {}, Attachment, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Attachment & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    mimetype?: import("mongoose").SchemaDefinitionProperty<string, Attachment, import("mongoose").Document<unknown, {}, Attachment, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Attachment & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    size?: import("mongoose").SchemaDefinitionProperty<number, Attachment, import("mongoose").Document<unknown, {}, Attachment, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Attachment & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    taskId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Attachment, import("mongoose").Document<unknown, {}, Attachment, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Attachment & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    uploadedBy?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Attachment, import("mongoose").Document<unknown, {}, Attachment, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Attachment & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    createdAt?: import("mongoose").SchemaDefinitionProperty<Date, Attachment, import("mongoose").Document<unknown, {}, Attachment, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Attachment & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, Attachment>;
