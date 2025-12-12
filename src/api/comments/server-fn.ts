import { createServerFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'
import type {
  CreateCommentPayload,
  DeleteCommentPayload,
  GetCommentsPayload,
} from './types'
import { db } from '@/db'
import { todoComments } from '@/db/schema/todo-comments'
import { requireAuth } from '@/lib/auth'

export const getComments = createServerFn({
  method: 'GET',
})
  .inputValidator((data: GetCommentsPayload) => data)
  .handler(async (ctx) => {
    requireAuth(ctx)

    if (!ctx.data.todoId) return []
    return await db.query.todoComments.findMany({
      where: eq(todoComments.todoId, ctx.data.todoId),
      orderBy: (comment, { desc }) => [desc(comment.createdAt)],
    })
  })

export const createComment = createServerFn({
  method: 'POST',
})
  .inputValidator((data: CreateCommentPayload) => data)
  .handler(async (ctx) => {
    requireAuth(ctx)

    const [newComment] = await db
      .insert(todoComments)
      .values({
        content: ctx.data.content,
        todoId: ctx.data.todoId,
      })
      .returning()
    return newComment
  })

export const deleteComment = createServerFn({
  method: 'POST',
})
  .inputValidator((data: DeleteCommentPayload) => data)
  .handler(async (ctx) => {
    requireAuth(ctx)

    const [deletedComment] = await db
      .delete(todoComments)
      .where(eq(todoComments.id, ctx.data.id))
      .returning()
    return deletedComment
  })
