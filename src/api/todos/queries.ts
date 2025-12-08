import { useMutation, useQuery } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import {
  createTodo,
  deleteTodo,
  getTodos,
  toggleComplete,
  updateTodo,
} from '@/server-fn/todos'

export const useGetTodosQuery = () => {
  return useQuery({
    queryKey: ['todos'],
    queryFn: async () => await getTodos(),
  })
}

export const useCreateTodoMutation = () => {
  const router = useRouter()
  return useMutation({
    mutationFn: createTodo,
    onSuccess: () => {
      router.invalidate()
    },
    onError: (error) => {
      console.error('Failed to create todo:', error.message)
    },
  })
}

export const useDeleteTodoMutation = () => {
  const router = useRouter()
  return useMutation({
    mutationFn: deleteTodo,
    onSuccess: () => {
      router.invalidate()
    },
    onError: (error) => {
      console.error('Failed to delete todo:', error.message)
    },
  })
}

export const useUpdateTodoMutation = () => {
  const router = useRouter()
  return useMutation({
    mutationFn: updateTodo,
    onSuccess: () => {
      router.invalidate()
    },
    onError: (error) => {
      console.error('Failed to update todo:', error.message)
    },
  })
}

export const useToggleCompleteMutation = () => {
  const router = useRouter()
  return useMutation({
    mutationFn: toggleComplete,
    onSuccess: () => {
      router.invalidate()
    },
    onError: (error) => {
      console.error('Failed to toggle complete:', error.message)
    },
  })
}
