'use client'

import { useTransition } from 'react'
import { Trash2 } from 'lucide-react'
import { deleteUserAction } from '@/actions/users'

interface DeleteUserButtonProps {
  userId: string
  confirmText: string
  deleteText: string
  errorText: string
}

export default function DeleteUserButton({ userId, confirmText, deleteText, errorText }: DeleteUserButtonProps) {
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    if (confirm(confirmText)) {
      startTransition(async () => {
        const res = await deleteUserAction(userId)
        if (!res.success) {
          alert(res.error || errorText)
        }
      })
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      title={deleteText}
      style={{
        padding: '6px 10px',
        borderRadius: '8px',
        background: '#fee2e2',
        border: 'none',
        cursor: isPending ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#dc2626',
        opacity: isPending ? 0.6 : 1,
        transition: 'all 0.2s ease',
      }}
    >
      <Trash2 size={15} />
    </button>
  )
}
