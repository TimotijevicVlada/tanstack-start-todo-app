import { config } from 'dotenv'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { users } from './schema/users'
import { todos } from './schema/todos'
import { todoComments } from './schema/todo-comments'

config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
})

export const db = drizzle(pool, {
  schema: {
    users,
    todos,
    todoComments,
  },
})
