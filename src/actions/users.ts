'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function deleteUserAction(userId: string) {
  const session = await getSession()
  if (!session || session.role !== 'SUPER_ADMIN') {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    // ParentChild has onDelete: Cascade, but other relations might block deletion.
    // We attempt to delete, and if it fails due to FK constraints, we return a user-friendly error.
    await prisma.user.delete({
      where: { id: userId }
    })
    revalidatePath('/super-admin/users')
    return { success: true }
  } catch (error) {
    console.error('Delete user error:', error)
    return { 
      success: false, 
      error: "Impossible de supprimer l'utilisateur car il possède des données associées (classes, activités, etc.)." 
    }
  }
}
