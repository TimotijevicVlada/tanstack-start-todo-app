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
import { requireAuth } from '@/lib/auth'
import { todos } from '@/db/schema/todos'

export const getTodos = createServerFn({
  method: 'GET',
}).handler(async (ctx) => {
  const userId = requireAuth(ctx)

  return await db.query.todos.findMany({
    where: eq(todos.userId, userId),
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
  .handler(async (ctx) => {
    const userId = requireAuth(ctx)

    const todo = await db.query.todos.findFirst({
      where: eq(todos.id, ctx.data.id),
    })

    // Verify ownership
    if (!todo || todo.userId !== userId) {
      throw new Error('Todo not found or access denied')
    }

    return todo
  })

export const createTodo = createServerFn({
  method: 'POST',
})
  .inputValidator((data: CreateTodoPayload) => data)
  .handler(async (ctx) => {
    const userId = requireAuth(ctx)

    const [newTodo] = await db
      .insert(todos)
      .values({
        userId,
        title: ctx.data.title,
        description: ctx.data.description,
      })
      .returning()
    return newTodo
  })

export const deleteTodo = createServerFn({
  method: 'POST',
})
  .inputValidator((data: DeleteTodoPayload) => data)
  .handler(async (ctx) => {
    const userId = requireAuth(ctx)

    const todo = await db.query.todos.findFirst({
      where: eq(todos.id, ctx.data.id),
    })

    if (!todo || todo.userId !== userId) {
      throw new Error('Todo not found or access denied')
    }

    const [deletedTodo] = await db
      .delete(todos)
      .where(eq(todos.id, ctx.data.id))
      .returning()
    return deletedTodo
  })

export const updateTodo = createServerFn({
  method: 'POST',
})
  .inputValidator((data: UpdateTodoPayload) => data)
  .handler(async (ctx) => {
    const userId = requireAuth(ctx)

    const todo = await db.query.todos.findFirst({
      where: eq(todos.id, ctx.data.id),
    })

    if (!todo || todo.userId !== userId) {
      throw new Error('Todo not found or access denied')
    }

    const [updatedTodo] = await db
      .update(todos)
      .set({ title: ctx.data.title, description: ctx.data.description })
      .where(eq(todos.id, ctx.data.id))
      .returning()
    return updatedTodo
  })

export const toggleComplete = createServerFn({
  method: 'POST',
})
  .inputValidator((data: ToggleCompletePayload) => data)
  .handler(async (ctx) => {
    const { data } = ctx
    const userId = requireAuth(ctx)

    const todo = await db.query.todos.findFirst({
      where: eq(todos.id, data.id),
    })

    if (!todo || todo.userId !== userId) {
      throw new Error('Todo not found or access denied')
    }

    const [updatedTodo] = await db
      .update(todos)
      .set({ completed: !data.completed })
      .where(eq(todos.id, data.id))
      .returning()
    return updatedTodo
  })
