import { HydratedDocument, Types } from 'mongoose';
import mongoose from 'mongoose';
export declare enum ActivityAction {
    CREATED = "created",
    UPDATED = "updated",
    ASSIGNED = "assigned",
    STATUS_CHANGED = "status_changed"
}
export type ActivityLogDocument = HydratedDocument<ActivityLog>;
export declare class ActivityLog {
    taskId: Types.ObjectId;
    userId: Types.ObjectId;
    action: ActivityAction;
    metadata?: Record<string, any>;
    timestamp: Date;
}
export declare const ActivityLogSchema: mongoose.Schema<ActivityLog, mongoose.Model<ActivityLog, any, any, any, any, any, ActivityLog>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, ActivityLog, mongoose.Document<unknown, {}, ActivityLog, {
    id: string;
}, mongoose.DefaultSchemaOptions> & Omit<ActivityLog & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    taskId?: mongoose.SchemaDefinitionProperty<Types.ObjectId, ActivityLog, mongoose.Document<unknown, {}, ActivityLog, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<ActivityLog & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    userId?: mongoose.SchemaDefinitionProperty<Types.ObjectId, ActivityLog, mongoose.Document<unknown, {}, ActivityLog, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<ActivityLog & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    action?: mongoose.SchemaDefinitionProperty<ActivityAction, ActivityLog, mongoose.Document<unknown, {}, ActivityLog, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<ActivityLog & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    metadata?: mongoose.SchemaDefinitionProperty<Record<string, any> | undefined, ActivityLog, mongoose.Document<unknown, {}, ActivityLog, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<ActivityLog & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    timestamp?: mongoose.SchemaDefinitionProperty<Date, ActivityLog, mongoose.Document<unknown, {}, ActivityLog, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<ActivityLog & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, ActivityLog>;
