import { createServerFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'
import type {
  CreateCommentPayload,
  DeleteCommentPayload,
  GetCommentsPayload,
} from './types'
import { db } from '@/db'
import { todoComments } from '@/db/schema'

export const getComments = createServerFn({
  method: 'GET',
})
  .inputValidator((data: GetCommentsPayload) => data)
  .handler(async ({ data }) => {
    if (!data.todoId) return []
    return await db.query.todoComments.findMany({
      where: eq(todoComments.todoId, data.todoId),
      orderBy: (comment, { desc }) => [desc(comment.createdAt)],
    })
  })

export const createComment = createServerFn({
  method: 'POST',
})
  .inputValidator((data: CreateCommentPayload) => data)
  .handler(async ({ data }) => {
    const [newComment] = await db
      .insert(todoComments)
      .values({
        content: data.content,
        todoId: data.todoId,
      })
      .returning()
    return newComment
  })

export const deleteComment = createServerFn({
  method: 'POST',
})
  .inputValidator((data: DeleteCommentPayload) => data)
  .handler(async ({ data }) => {
    const [deletedComment] = await db
      .delete(todoComments)
      .where(eq(todoComments.id, data.id))
      .returning()
    return deletedComment
  })
