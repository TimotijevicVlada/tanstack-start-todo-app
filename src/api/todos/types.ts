export interface CreateTodoPayload {
  title: string
  description: string
}

export interface GetTodoByIdPayload {
  id: string
}

export interface DeleteTodoPayload {
  id: string
}

export interface UpdateTodoPayload {
  id: string
  title: string
  description: string
}

export interface ToggleCompletePayload {
  id: string
  completed: boolean
}
