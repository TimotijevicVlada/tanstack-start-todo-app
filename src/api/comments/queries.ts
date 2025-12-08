import { useMutation } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { createComment, deleteComment } from './server-fn'

export const useCreateCommentMutation = () => {
  const router = useRouter()

  return useMutation({
    mutationFn: createComment,
    onSuccess: () => {
      router.invalidate()
    },
    onError: (error) => {
      console.error('Failed to create comment:', error.message)
    },
  })
}

export const useDeleteCommentMutation = () => {
  const router = useRouter()

  return useMutation({
    mutationFn: deleteComment,
    onSuccess: () => {
      router.invalidate()
    },
    onError: (error) => {
      console.error('Failed to delete comment:', error.message)
    },
  })
}
