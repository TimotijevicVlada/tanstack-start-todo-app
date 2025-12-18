import { createFileRoute, useNavigate } from '@tanstack/react-router'
import {
  Check,
  ChevronRight,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  X,
} from 'lucide-react'
import {
  useCreateTodoMutation,
  useDeleteTodoMutation,
  // useGetTodosQuery,
  useToggleCompleteMutation,
  useUpdateTodoMutation,
} from '@/api/todos/queries'
import { getTodos } from '@/api/todos/server-fn'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export const Route = createFileRoute('/_private/drizzle/')({
  component: DemoDrizzle,
  loader: async () => await getTodos(),
})

function DemoDrizzle() {
  const navigate = useNavigate()
  // const { data: todosData, isLoading: isLoadingTodos } = useGetTodosQuery()

  const todosData = Route.useLoaderData()

  const { mutate: createTodoMutation, isPending: isCreatingTodo } =
    useCreateTodoMutation()
  const { mutate: deleteTodoMutation } = useDeleteTodoMutation()
  const { mutate: updateTodoMutation, isPending: isUpdatingTodo } =
    useUpdateTodoMutation()
  const { mutate: toggleCompleteMutation } = useToggleCompleteMutation()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const title = formData.get('title') as string
    const description = formData.get('description') as string

    if (!title || !description) return

    createTodoMutation({ data: { title, description } })
  }

  const handleDelete = (id: string) => {
    deleteTodoMutation({ data: { id } })
  }

  const handleUpdate = (e: React.FormEvent<HTMLFormElement>, id: string) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const title = formData.get('title') as string
    const description = formData.get('description') as string

    if (!title || !description) return

    updateTodoMutation({ data: { id, title, description } })
  }

  const handleToggleComplete = (id: string, completed: boolean) => {
    toggleCompleteMutation({ data: { id, completed } })
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4 text-white">
      <div
        className="w-full max-w-2xl p-8 rounded-xl shadow-2xl border border-white/10"
        style={{
          background:
            'linear-gradient(135deg, rgba(22, 32, 46, 0.95) 0%, rgba(12, 26, 43, 0.95) 100%)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <div
          className="flex items-center justify-center gap-4 mb-8 p-4 rounded-lg"
          style={{
            background:
              'linear-gradient(90deg, rgba(93, 103, 227, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
            border: '1px solid rgba(93, 103, 227, 0.2)',
          }}
        >
          <div className="relative group">
            <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-lg blur-lg opacity-60 group-hover:opacity-100 transition duration-500"></div>
            <div className="relative bg-gradient-to-br from-indigo-600 to-purple-600 p-3 rounded-lg">
              <img
                src="/drizzle.svg"
                alt="Drizzle Logo"
                className="w-8 h-8 transform group-hover:scale-110 transition-transform duration-300"
              />
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-300 via-purple-300 to-indigo-300 text-transparent bg-clip-text">
            Drizzle Database Demo
          </h1>
        </div>

        <h2 className="text-2xl font-bold mb-4 text-indigo-200">Todos</h2>

        <ul className="space-y-3 mb-6">
          {todosData.map((todo) => (
            <li
              key={todo.id}
              className="rounded-lg p-4 shadow-md border transition-all hover:scale-[1.02] cursor-pointer group"
              style={{
                background:
                  'linear-gradient(135deg, rgba(93, 103, 227, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)',
                borderColor: 'rgba(93, 103, 227, 0.3)',
              }}
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-medium text-white group-hover:text-indigo-200 transition-colors">
                    {todo.title}
                  </span>
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        handleToggleComplete(todo.id, todo.completed ?? false)
                      }
                    >
                      {todo.completed ? (
                        <X className="w-4 h-4" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDelete(todo.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                {todo.description && (
                  <p className="text-sm text-indigo-300/70">
                    {todo.description}
                  </p>
                )}
                <form
                  onSubmit={(e) => handleUpdate(e, todo.id)}
                  className="flex gap-3"
                >
                  <Input
                    type="text"
                    name="title"
                    placeholder="Update title..."
                    defaultValue={todo.title}
                  />
                  <Input
                    type="text"
                    name="description"
                    placeholder="Update description..."
                    defaultValue={todo.description}
                  />
                  <Button type="submit" variant="outline">
                    {isUpdatingTodo ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Pencil className="w-4 h-4" />
                    )}
                    Update
                  </Button>
                </form>
              </div>
              <div
                className="flex items-center justify-between mt-4 hover:bg-white/5 cursor-pointer px-3 py-1 rounded-lg"
                onClick={() =>
                  navigate({
                    to: '/comments/$todoId',
                    params: { todoId: todo.id },
                  })
                }
              >
                <h3 className="text-base font-medium text-white">
                  View comments
                </h3>
                <ChevronRight className="w-4 h-4" />
              </div>
            </li>
          ))}
          {/* {isLoadingTodos && (
            <li className="text-center py-8 text-indigo-300/70">
              Loading todos...
            </li>
          )} */}
          {todosData.length === 0 && (
            <li className="text-center py-8 text-indigo-300/70">
              No todos yet. Create one below!
            </li>
          )}
        </ul>

        <form
          onSubmit={handleSubmit}
          className="flex gap-2 border-t border-white/10 pt-4"
        >
          <Input type="text" name="title" placeholder="Add a new todo..." />
          <Input
            type="text"
            name="description"
            placeholder="Add a new description..."
          />

          <Button type="submit" variant="outline">
            {isCreatingTodo ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Add Todo
          </Button>
        </form>
      </div>
    </div>
  )
}
