import { createServerFn } from '@tanstack/react-start'
import { asc, eq } from 'drizzle-orm'
import type {
  CreateTodoPayload,
  DeleteTodoPayload,
  GetTodoByIdPayload,
  ToggleCompletePayload,
  UpdateTodoPayload,
} from '@/api/todos/types'
import { db } from '@/db'
import { todos } from '@/db/schema'

export const getTodos = createServerFn({
  method: 'GET',
}).handler(async () => {
  return await db.query.todos.findMany({
    orderBy: [asc(todos.createdAt)],
    // NOTE: if I want to include the comments:
    // with: {
    //   comments: true,
    // },
  })
})

export const getTodoById = createServerFn({
  method: 'GET',
})
  .inputValidator((data: GetTodoByIdPayload) => data)
  .handler(async ({ data }) => {
    return await db.query.todos.findFirst({
      where: eq(todos.id, data.id),
    })
  })

export const createTodo = createServerFn({
  method: 'POST',
})
  .inputValidator((data: CreateTodoPayload) => data)
  .handler(async ({ data }) => {
    const [newTodo] = await db
      .insert(todos)
      .values({ title: data.title, description: data.description })
      .returning()
    return newTodo
  })

export const deleteTodo = createServerFn({
  method: 'POST',
})
  .inputValidator((data: DeleteTodoPayload) => data)
  .handler(async ({ data }) => {
    const [deletedTodo] = await db
      .delete(todos)
      .where(eq(todos.id, data.id))
      .returning()
    return deletedTodo
  })

export const updateTodo = createServerFn({
  method: 'POST',
})
  .inputValidator((data: UpdateTodoPayload) => data)
  .handler(async ({ data }) => {
    const [updatedTodo] = await db
      .update(todos)
      .set({ title: data.title, description: data.description })
      .where(eq(todos.id, data.id))
      .returning()
    return updatedTodo
  })

export const toggleComplete = createServerFn({
  method: 'POST',
})
  .inputValidator((data: ToggleCompletePayload) => data)
  .handler(async ({ data }) => {
    const [updatedTodo] = await db
      .update(todos)
      .set({ completed: !data.completed })
      .where(eq(todos.id, data.id))
      .returning()
    return updatedTodo
  })
