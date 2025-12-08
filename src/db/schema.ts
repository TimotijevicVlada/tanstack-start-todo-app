import { boolean, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

export const todos = pgTable('todos', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull().default(''),
  completed: boolean('completed').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date()),
})

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

export const todosRelations = relations(todos, ({ many }) => ({
  comments: many(todoComments),
}))

export const todoCommentsRelations = relations(todoComments, ({ one }) => ({
  todo: one(todos, {
    fields: [todoComments.todoId],
    references: [todos.id],
  }),
}))
