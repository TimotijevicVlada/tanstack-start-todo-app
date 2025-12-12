import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { todos } from './todos'

export const todoComments = pgTable('todo_comments', {
  id: uuid('id').defaultRandom().primaryKey(),
  todoId: uuid('todo_id')
    .notNull()
    .references(() => todos.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date()),
})
