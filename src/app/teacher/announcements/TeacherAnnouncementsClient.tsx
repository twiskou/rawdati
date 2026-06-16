'use client'

import { useState, useTransition } from 'react'
import { Plus, Trash2, Edit2, X } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/LanguageContext'

interface Announcement {
  id: string
  title: string
  content: string
  type: string
  createdAt: string
}

interface TeacherAnnouncementsClientProps {
  announcements: Announcement[]
  kindergartenId: string | null
}



const badgeColors: Record<string, { bg: string; color: string }> = {
  MEETING: { bg: '#ede9fe', color: '#7c3aed' },
  OUTING: { bg: '#d1fae5', color: '#059669' },
  EVENT: { bg: '#fef3c7', color: '#d97706' },
  INFO: { bg: '#dbeafe', color: '#2563eb' },
}

export default function TeacherAnnouncementsClient({ announcements, kindergartenId }: TeacherAnnouncementsClientProps) {
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [type, setType] = useState('INFO')
  const [msg, setMsg] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const { t, isRTL } = useLanguage()
  const tr = t.teacher.announcements
  const trForm = t.teacher.activities.form // Reuse from activities where applicable, or inline

  const typeLabels: Record<string, string> = {
    MEETING: isRTL ? 'اجتماع' : 'Réunion',
    OUTING: isRTL ? 'خرجة' : 'Sortie',
    EVENT: isRTL ? 'حدث' : 'Événement',
    INFO: isRTL ? 'معلومة' : 'Info',
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 14px',
    border: '1.5px solid #e2e8f0', borderRadius: '12px',
    fontSize: '14px', color: '#1e293b', background: '#f8fafc',
    outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
    textAlign: isRTL ? 'right' : 'left',
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!kindergartenId) return
    startTransition(async () => {
      const res = await fetch('/api/teacher/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, type, kindergartenId }),
      })
      if (res.ok) {
        setMsg(tr.successPublish)
        setShowForm(false)
        setTitle('')
        setContent('')
        setTimeout(() => window.location.reload(), 800)
      } else {
        setMsg(tr.errorPublish)
      }
      setTimeout(() => setMsg(null), 3000)
    })
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
        <button
          onClick={() => setShowForm(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px',
            background: 'linear-gradient(135deg, #F72585, #4361EE)',
            border: 'none', borderRadius: '12px', color: 'white',
            fontSize: '14px', fontWeight: '600', cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(247,37,133,0.3)',
          }}
        >
          <Plus size={16} />
          {tr.newAnnouncement}
        </button>
      </div>

      {msg && (
        <div
          style={{
            padding: '12px 16px', borderRadius: '12px', marginBottom: '20px',
            background: msg === tr.successPublish ? '#d1fae5' : '#fee2e2',
            color: msg === tr.successPublish ? '#059669' : '#dc2626',
            fontSize: '14px', fontWeight: '500',
          }}
        >
          {msg}
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
          }}
          onClick={() => setShowForm(false)}
        >
          <div
            style={{
              background: 'white', borderRadius: '24px', padding: '36px',
              width: '100%', maxWidth: '540px', boxShadow: '0 24px 80px rgba(0,0,0,0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#0f172a' }}>{tr.newAnnouncement}</h2>
              <button
                onClick={() => setShowForm(false)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer', padding: '6px', display: 'flex' }}
              >
                <X size={20} color="#374151" />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: isRTL ? 'right' : 'left' }}>
                  {tr.form.title}
                </label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder={isRTL ? 'عنوان الإعلان' : "Titre de l'annonce"} style={inputStyle} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: isRTL ? 'right' : 'left' }}>
                  {tr.form.content}
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required rows={5}
                  placeholder={isRTL ? 'اكتب إعلانك هنا...' : "Rédigez votre annonce..."}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: isRTL ? 'right' : 'left' }}>
                  {tr.form.type}
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                  {Object.entries(typeLabels).map(([key, label]) => {
                    const badge = badgeColors[key]
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setType(key)}
                        style={{
                          padding: '8px', borderRadius: '10px', border: '2px solid',
                          borderColor: type === key ? badge.color : 'transparent',
                          background: badge.bg, color: badge.color,
                          fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                        }}
                      >
                        {label}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  style={{
                    flex: 1, padding: '13px', border: '1.5px solid #e2e8f0', borderRadius: '12px',
                    background: 'white', fontSize: '14px', fontWeight: '600', cursor: 'pointer', color: '#374151',
                  }}
                >
                  {tr.form.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  style={{
                    flex: 1, padding: '13px',
                    background: isPending ? '#9ca3af' : 'linear-gradient(135deg, #F72585, #4361EE)',
                    border: 'none', borderRadius: '12px', color: 'white',
                    fontSize: '14px', fontWeight: '600', cursor: isPending ? 'not-allowed' : 'pointer',
                  }}
                >
                  {isPending ? tr.form.publishing : tr.form.publish}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* List */}
      {announcements.length === 0 ? (
        <div style={{ background: 'white', borderRadius: '20px', padding: '60px 40px', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <p style={{ fontSize: '64px', margin: '0 0 16px' }}>📢</p>
          <p style={{ fontSize: '18px', fontWeight: '600', color: '#374151', margin: 0 }}>{tr.noAnnouncements}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {announcements.map((ann) => {
            const badge = badgeColors[ann.type] ?? { bg: '#f1f5f9', color: '#475569' }
            return (
              <div
                key={ann.id}
                style={{
                  background: 'white', borderRadius: '16px', padding: '20px 24px',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                  display: 'flex', gap: '16px', alignItems: 'flex-start',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <span style={{ padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: '600', background: badge.bg, color: badge.color }}>
                      {typeLabels[ann.type]}
                    </span>
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                      {new Date(ann.createdAt).toLocaleDateString(isRTL ? 'ar-EG' : 'fr-FR')}
                    </span>
                  </div>
                  <h3 style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>{ann.title}</h3>
                  <p style={{ margin: 0, fontSize: '13px', color: '#64748b', lineHeight: '1.5' }}>
                    {ann.content.length > 150 ? ann.content.substring(0, 150) + '...' : ann.content}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  <button style={{ padding: '7px 12px', borderRadius: '8px', background: '#f1f5f9', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '500', color: '#374151' }}>
                    <Edit2 size={13} /> {tr.edit}
                  </button>
                  <button style={{ padding: '7px 12px', borderRadius: '8px', background: '#fee2e2', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '500', color: '#ef4444' }}>
                    <Trash2 size={13} /> {tr.delete}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
