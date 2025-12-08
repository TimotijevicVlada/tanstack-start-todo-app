import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import { ChevronLeft, Loader2, Trash2 } from 'lucide-react'
import { useRef } from 'react'
import { getComments } from '@/api/comments/server-fn'
import {
  useCreateCommentMutation,
  useDeleteCommentMutation,
} from '@/api/comments/queries'
import { getTodoById } from '@/api/todos/server-fn'

export const Route = createFileRoute('/_private/comments/$todoId')({
  component: RouteComponent,
  loader: async ({ params }) => {
    const [comments, todo] = await Promise.all([
      getComments({ data: { todoId: params.todoId } }),
      getTodoById({ data: { id: params.todoId } }),
    ])
    return { comments, todo }
  },
})

function RouteComponent() {
  const { comments, todo } = Route.useLoaderData()
  const navigate = useNavigate()

  const inputRef = useRef<HTMLInputElement>(null)

  const { todoId } = useParams({ from: '/_private/comments/$todoId' })

  const { mutate: createCommentMutation, isPending: isCreatingComment } =
    useCreateCommentMutation()
  const { mutate: deleteCommentMutation, isPending: isDeletingComment } =
    useDeleteCommentMutation()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const content = formData.get('content') as string
    if (!content) return
    createCommentMutation({ data: { content, todoId } })
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  return (
    <div className="flex justify-center min-h-screen p-4 text-white">
      <div
        className="w-full max-w-2xl p-8 rounded-xl shadow-2xl border border-white/10"
        style={{
          background:
            'linear-gradient(135deg, rgba(22, 32, 46, 0.95) 0%, rgba(12, 26, 43, 0.95) 100%)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <div
          onClick={() => navigate({ to: '/drizzle' })}
          className="flex items-center justify-between gap-2 cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <ChevronLeft className="w-6 h-6" />
            <h1 className="text-xl font-bold">Comments</h1>
          </div>
          <h1 className="text-xl font-bold">{todo?.title}</h1>
        </div>
        <form onSubmit={handleSubmit} className="flex gap-2 my-4">
          <input
            type="text"
            name="content"
            placeholder="Add a comment..."
            className="min-w-0 h-10 flex-1 px-4 rounded-lg border focus:outline-none focus:ring-2 transition-all text-white placeholder-indigo-300/50 flex-1"
            style={{
              background: 'rgba(93, 103, 227, 0.1)',
              borderColor: 'rgba(93, 103, 227, 0.3)',
            }}
            ref={inputRef}
          />
          <button
            type="submit"
            className="flex items-center gap-2 h-10 px-6 font-semibold rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105 active:scale-95 whitespace-nowrap cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #5d67e3 0%, #8b5cf6 100%)',
              color: 'white',
            }}
          >
            {isCreatingComment && <Loader2 className="w-4 h-4 animate-spin" />}
            Add comment
          </button>
        </form>
        {comments.length === 0 && (
          <p className="text-center text-indigo-300/70 mt-30">
            No comments yet.
          </p>
        )}
        <ul className="space-y-3 mb-6">
          {comments.map((comment) => (
            <li
              key={comment.id}
              className="flex items-center justify-between hover:bg-white/5 py-1 px-3 rounded-lg"
            >
              {comment.content}
              <button
                className="text-red-500 hover:text-red-600 transition-colors cursor-pointer"
                onClick={() =>
                  deleteCommentMutation({ data: { id: comment.id } })
                }
              >
                {isDeletingComment ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
