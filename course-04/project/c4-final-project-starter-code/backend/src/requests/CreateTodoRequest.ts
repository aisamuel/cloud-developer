/**
 * Fields in a request to create a single TODO item.
 */
export interface CreateTodoRequest {
  name: string;
  dueDate: string;
  done: boolean;
  attachmentUrl?: string;
}

export interface CreateTodoPayload extends CreateTodoRequest {
  userId: string;
  id: any;
}
