'use client'

import { useState, useTransition, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Edit2, Calendar, Image as ImageIcon, X, AlertTriangle, MapPin, Upload } from 'lucide-react'

interface Activity {
  id: string
  title: string
  description: string | null
  activityDate: string
  mediaCount: number
  classroomId: string
  className?: string
}

interface ClassroomOption {
  id: string
  name: string
}

interface TeacherActivitiesClientProps {
  activities: Activity[]
  classrooms: ClassroomOption[]
}

export default function TeacherActivitiesClient({ activities: initial, classrooms }: TeacherActivitiesClientProps) {
  const router = useRouter()
  const [activities, setActivities] = useState<Activity[]>(initial)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  
  // Media Upload State
  const [uploadActivityId, setUploadActivityId] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isPending, startTransition] = useTransition()
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [activityDate, setActivityDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedClassroom, setSelectedClassroom] = useState(classrooms[0]?.id || '')

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 14px',
    border: '1.5px solid #e2e8f0',
    borderRadius: '12px',
    fontSize: '14px',
    color: '#1e293b',
    background: '#f8fafc',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  }

  function showMessage(type: 'success' | 'error', text: string) {
    setMsg({ type, text })
    setTimeout(() => setMsg(null), 4000)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedClassroom && !editId) {
      showMessage('error', 'Veuillez sélectionner une classe')
      return
    }

    startTransition(async () => {
      const url = '/api/teacher/activities'
      const method = editId ? 'PUT' : 'POST'
      const body = editId
        ? JSON.stringify({ id: editId, title, description, activityDate })
        : JSON.stringify({ title, description, activityDate, classroomId: selectedClassroom })

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body,
      })

      if (res.ok) {
        const data = await res.json()
        showMessage('success', editId ? 'Activité modifiée avec succès !' : 'Activité publiée avec succès !')
        
        if (editId) {
          setActivities(prev => prev.map(a => a.id === editId ? { ...a, title, description, activityDate } : a))
        } else {
          const className = classrooms.find(c => c.id === data.classroomId)?.name
          setActivities(prev => [{ ...data, mediaCount: 0, className }, ...prev])
        }

        setShowForm(false)
        setTitle('')
        setDescription('')
        setEditId(null)
      } else {
        showMessage('error', editId ? 'Erreur lors de la modification' : 'Erreur lors de la publication')
      }
    })
  }

  async function handleDelete() {
    if (!deleteId) return
    startTransition(async () => {
      const res = await fetch(`/api/teacher/activities?id=${deleteId}`, { method: 'DELETE' })
      if (res.ok) {
        setActivities(prev => prev.filter(a => a.id !== deleteId))
        showMessage('success', 'Activité supprimée avec succès !')
      } else {
        showMessage('error', 'Erreur lors de la suppression')
      }
      setDeleteId(null)
    })
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!uploadActivityId || !e.target.files || e.target.files.length === 0) return
    
    setUploading(true)
    const formData = new FormData()
    formData.append('activityId', uploadActivityId)
    
    // Append all selected files
    for (let i = 0; i < e.target.files.length; i++) {
      formData.append('files', e.target.files[i])
    }

    try {
      const res = await fetch('/api/teacher/activities/media', {
        method: 'POST',
        body: formData,
      })
      
      if (res.ok) {
        const data = await res.json()
        showMessage('success', `${data.count} photo(s) ajoutée(s) avec succès !`)
        
        // Update media count in state
        setActivities(prev => prev.map(a => 
          a.id === uploadActivityId ? { ...a, mediaCount: a.mediaCount + data.count } : a
        ))
      } else {
        showMessage('error', 'Erreur lors du téléchargement des photos')
      }
    } catch (error) {
      showMessage('error', 'Une erreur est survenue')
    } finally {
      setUploading(false)
      setUploadActivityId(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      router.refresh()
    }
  }

  return (
    <div>
      {/* Hidden File Input for Image Upload */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        multiple
        accept="image/*"
        onChange={handleFileUpload}
      />

      {/* Header actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div />
        <button
          onClick={() => {
            setEditId(null)
            setTitle('')
            setDescription('')
            setActivityDate(new Date().toISOString().split('T')[0])
            setShowForm(true)
          }}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px',
            background: 'linear-gradient(135deg, #F72585, #4361EE)',
            border: 'none', borderRadius: '12px', color: 'white',
            fontSize: '14px', fontWeight: '600', cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(247,37,133,0.3)', transition: 'transform 0.15s ease'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <Plus size={18} />
          Nouvelle activité
        </button>
      </div>

      {/* Message */}
      {msg && (
        <div
          style={{
            padding: '14px 18px', borderRadius: '12px', marginBottom: '20px',
            background: msg.type === 'success' ? '#d1fae5' : '#fee2e2',
            color: msg.type === 'success' ? '#059669' : '#dc2626',
            fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px',
            animation: 'fadeIn 0.3s ease'
          }}
        >
          {msg.type === 'success' ? '✅' : <AlertTriangle size={18} />}
          {msg.text}
        </div>
      )}

      {/* Modal form */}
      {showForm && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)',
            zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
            backdropFilter: 'blur(4px)', animation: 'fadeIn 0.2s ease'
          }}
          onClick={() => setShowForm(false)}
        >
          <div
            style={{
              background: 'white', borderRadius: '24px', padding: '36px',
              width: '100%', maxWidth: '520px', boxShadow: '0 24px 80px rgba(0,0,0,0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>
                {editId ? 'Modifier l\'activité' : 'Nouvelle activité'}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', cursor: 'pointer', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={18} color="#374151" />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {!editId && classrooms.length > 0 && (
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>
                    Classe *
                  </label>
                  <select
                    value={selectedClassroom}
                    onChange={(e) => setSelectedClassroom(e.target.value)}
                    required
                    style={inputStyle}
                  >
                    {classrooms.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>
                  Titre *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="Ex: Atelier peinture, Sortie au parc..."
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Décrivez l'activité pour les parents..."
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>
                  Date *
                </label>
                <input
                  type="date"
                  value={activityDate}
                  onChange={(e) => setActivityDate(e.target.value)}
                  required
                  style={inputStyle}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  style={{
                    flex: 1, padding: '14px', border: '1.5px solid #e2e8f0', borderRadius: '14px',
                    background: 'white', fontSize: '14px', fontWeight: '600', cursor: 'pointer', color: '#374151',
                  }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  style={{
                    flex: 1, padding: '14px',
                    background: isPending ? '#9ca3af' : 'linear-gradient(135deg, #F72585, #4361EE)',
                    border: 'none', borderRadius: '14px', color: 'white',
                    fontSize: '14px', fontWeight: '700', cursor: isPending ? 'not-allowed' : 'pointer',
                  }}
                >
                  {isPending ? 'En cours...' : (editId ? 'Enregistrer' : 'Publier')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteId && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)',
            zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
            backdropFilter: 'blur(4px)', animation: 'fadeIn 0.2s ease'
          }}
          onClick={() => setDeleteId(null)}
        >
          <div
            style={{
              background: 'white', borderRadius: '24px', padding: '36px',
              width: '100%', maxWidth: '400px', boxShadow: '0 24px 80px rgba(0,0,0,0.2)', textAlign: 'center'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <Trash2 size={28} color="#ef4444" />
            </div>
            <h2 style={{ margin: '0 0 12px', fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>Supprimer l'activité ?</h2>
            <p style={{ margin: '0 0 32px', fontSize: '15px', color: '#64748b', lineHeight: '1.5' }}>Cette action est irréversible. Toutes les photos associées à cette activité seront également supprimées.</p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setDeleteId(null)} style={{ flex: 1, padding: '14px', border: '1.5px solid #e2e8f0', borderRadius: '14px', background: 'white', fontSize: '14px', fontWeight: '600', cursor: 'pointer', color: '#374151' }}>
                Annuler
              </button>
              <button onClick={handleDelete} disabled={isPending} style={{ flex: 1, padding: '14px', background: isPending ? '#9ca3af' : '#ef4444', border: 'none', borderRadius: '14px', color: 'white', fontSize: '14px', fontWeight: '700', cursor: isPending ? 'not-allowed' : 'pointer' }}>
                {isPending ? '...' : 'Oui, supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Activities list */}
      {activities.length === 0 ? (
        <div
          style={{
            background: 'white', borderRadius: '24px', padding: '80px 40px',
            textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.02)'
          }}
        >
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <span style={{ fontSize: '40px' }}>🎨</span>
          </div>
          <p style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: '0 0 8px' }}>
            Aucune activité publiée
          </p>
          <p style={{ color: '#64748b', margin: '0 0 24px', fontSize: '15px' }}>
            Partagez les moments forts de vos classes avec les parents.
          </p>
          <button
            onClick={() => setShowForm(true)}
            style={{
              padding: '12px 24px', background: 'linear-gradient(135deg, #F72585, #4361EE)',
              border: 'none', borderRadius: '12px', color: 'white',
              fontSize: '14px', fontWeight: '700', cursor: 'pointer',
            }}
          >
            Créer une activité
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {activities.map((activity) => (
            <div
              key={activity.id}
              style={{
                background: 'white', borderRadius: '20px', padding: '24px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.02)',
                display: 'flex', flexDirection: 'column', transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
              onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.06)' }}
              onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.03)' }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a', lineHeight: '1.3' }}>
                    {activity.title}
                  </h3>
                  {activity.className && (
                    <span style={{ fontSize: '11px', background: '#f1f5f9', color: '#475569', padding: '4px 8px', borderRadius: '6px', fontWeight: '600' }}>
                      {activity.className}
                    </span>
                  )}
                </div>
                
                {activity.description && (
                  <p style={{ margin: '0 0 16px', fontSize: '14px', color: '#475569', lineHeight: '1.6' }}>
                    {activity.description.length > 100 ? activity.description.substring(0, 100) + '...' : activity.description}
                  </p>
                )}
                
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '24px', padding: '12px', background: '#f8fafc', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={14} color="#64748b" />
                    <span style={{ fontSize: '13px', color: '#475569', fontWeight: '500' }}>
                      {new Date(activity.activityDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ImageIcon size={14} color={activity.mediaCount > 0 ? '#4361EE' : '#64748b'} />
                    <span style={{ fontSize: '13px', color: activity.mediaCount > 0 ? '#4361EE' : '#475569', fontWeight: '600' }}>
                      {activity.mediaCount} photo(s)
                    </span>
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                <button
                  onClick={() => {
                    setUploadActivityId(activity.id)
                    fileInputRef.current?.click()
                  }}
                  disabled={uploading && uploadActivityId === activity.id}
                  style={{
                    flex: 1, padding: '10px', borderRadius: '10px', background: '#e0e7ff',
                    border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    fontSize: '13px', fontWeight: '600', color: '#4361EE', transition: 'background 0.15s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = '#c7d2fe'}
                  onMouseOut={(e) => e.currentTarget.style.background = '#e0e7ff'}
                >
                  {uploading && uploadActivityId === activity.id ? '...' : <><Upload size={14} /> Photos</>}
                </button>

                <button
                  onClick={() => {
                    setEditId(activity.id)
                    setTitle(activity.title)
                    setDescription(activity.description || '')
                    setActivityDate(new Date(activity.activityDate).toISOString().split('T')[0])
                    setSelectedClassroom(activity.classroomId)
                    setShowForm(true)
                  }}
                  style={{
                    padding: '10px 14px', borderRadius: '10px', background: '#f1f5f9',
                    border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#64748b', transition: 'background 0.15s'
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.background = '#e2e8f0'; e.currentTarget.style.color = '#0f172a' }}
                  onMouseOut={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#64748b' }}
                >
                  <Edit2 size={16} />
                </button>

                <button
                  onClick={() => setDeleteId(activity.id)}
                  style={{
                    padding: '10px 14px', borderRadius: '10px', background: '#fee2e2',
                    border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#ef4444', transition: 'background 0.15s'
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.background = '#fecaca'; e.currentTarget.style.color = '#dc2626' }}
                  onMouseOut={(e) => { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.color = '#ef4444' }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  )
}
