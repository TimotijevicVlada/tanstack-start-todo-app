export interface CreateCommentPayload {
  content: string
  todoId: string
}

export interface GetCommentsPayload {
  todoId?: string
}

export interface DeleteCommentPayload {
  id: string
}
