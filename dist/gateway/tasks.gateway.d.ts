export declare class TasksGateway {
    emitTaskAssigned(assigneeId: string, payload: Record<string, any>): void;
    emitStatusChanged(userId: string, payload: Record<string, any>): void;
    emitDeadlineReminder(userId: string, payload: Record<string, any>): void;
}
