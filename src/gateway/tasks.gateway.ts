import { Injectable } from '@nestjs/common';

@Injectable()
export class TasksGateway {
  emitTaskAssigned(assigneeId: string, payload: Record<string, any>): void {
    // TODO: implement with Socket.io — emit 'task:assigned' to assigneeId's room
  }

  emitStatusChanged(userId: string, payload: Record<string, any>): void {
    // TODO: implement with Socket.io — emit 'task:status_changed' to userId's room
  }

  emitDeadlineReminder(userId: string, payload: Record<string, any>): void {
    // TODO: implement with Socket.io — emit 'deadline-reminder' to userId's room
  }
}
