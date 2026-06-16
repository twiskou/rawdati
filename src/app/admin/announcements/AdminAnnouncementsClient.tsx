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
  createdByName: string
}

interface AdminAnnouncementsClientProps {
  announcements: Announcement[]
  kindergartenId: string
}

export default function AdminAnnouncementsClient({ announcements, kindergartenId }: AdminAnnouncementsClientProps) {
  const { t, isRTL } = useLanguage()
  const tr = t.admin.announcements

  const typeConfig: Record<string, { label: string; bg: string; color: string }> = {
    MEETING: { label: tr.types.MEETING, bg: '#ede9fe', color: '#7c3aed' },
    OUTING:  { label: tr.types.OUTING,  bg: '#d1fae5', color: '#059669' },
    EVENT:   { label: tr.types.EVENT, bg: '#fef3c7', color: '#d97706' },
    INFO:    { label: tr.types.INFO,    bg: '#dbeafe', color: '#2563eb' },
  }

  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [type, setType] = useState('INFO')
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 14px',
    border: '1.5px solid #e2e8f0', borderRadius: '12px',
    fontSize: '14px', color: '#1e293b', background: '#f8fafc',
    outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const res = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, type, kindergartenId }),
      })
      if (res.ok) {
        setMsg({ ok: true, text: tr.successPub })
        setShowForm(false)
        setTitle(''); setContent(''); setType('INFO')
        setTimeout(() => window.location.reload(), 800)
      } else {
        setMsg({ ok: false, text: tr.errorPub })
      }
      setTimeout(() => setMsg(null), 3000)
    })
  }

  return (
    <div>
      {/* Toolbar */}
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
          {tr.newAnn}
        </button>
      </div>

      {msg && (
        <div style={{ padding: '12px 16px', borderRadius: '12px', marginBottom: '20px', background: msg.ok ? '#d1fae5' : '#fee2e2', color: msg.ok ? '#059669' : '#dc2626', fontSize: '14px', fontWeight: '500' }}>
          {msg.ok ? '✅' : '❌'} {msg.text}
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
          onClick={() => setShowForm(false)}
        >
          <div
            style={{ background: 'white', borderRadius: '24px', padding: '40px', width: '100%', maxWidth: '540px', boxShadow: '0 32px 80px rgba(0,0,0,0.2)', direction: isRTL ? 'rtl' : 'ltr' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
              <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '800', color: '#0f172a' }}>{tr.newAnn}</h2>
              <button onClick={() => setShowForm(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer', padding: '8px', display: 'flex' }}>
                <X size={20} color="#374151" />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {tr.formTitle}
                </label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required style={{ ...inputStyle, textAlign: isRTL ? 'right' : 'left' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {tr.formContent}
                </label>
                <textarea value={content} onChange={(e) => setContent(e.target.value)} required rows={5} style={{ ...inputStyle, resize: 'vertical', textAlign: isRTL ? 'right' : 'left' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {tr.formType}
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                  {Object.entries(typeConfig).map(([key, cfg]) => (
                    <button key={key} type="button" onClick={() => setType(key)}
                      style={{
                        padding: '10px 6px', borderRadius: '12px', border: '2px solid',
                        borderColor: type === key ? cfg.color : 'transparent',
                        background: cfg.bg, color: cfg.color,
                        fontSize: '12px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.15s',
                      }}
                    >
                      {cfg.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
                <button type="button" onClick={() => setShowForm(false)} style={{ flex: 1, padding: '14px', border: '1.5px solid #e2e8f0', borderRadius: '12px', background: 'white', fontSize: '14px', fontWeight: '600', cursor: 'pointer', color: '#374151' }}>
                  {tr.cancel}
                </button>
                <button type="submit" disabled={isPending} style={{ flex: 1, padding: '14px', background: isPending ? '#9ca3af' : 'linear-gradient(135deg, #F72585, #4361EE)', border: 'none', borderRadius: '12px', color: 'white', fontSize: '14px', fontWeight: '600', cursor: isPending ? 'not-allowed' : 'pointer' }}>
                  {isPending ? tr.publishing : tr.publish}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* List */}
      {announcements.length === 0 ? (
        <div style={{ background: 'white', borderRadius: '20px', padding: '60px', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <p style={{ fontSize: '64px', margin: '0 0 16px' }}>📢</p>
          <p style={{ fontSize: '18px', fontWeight: '600', color: '#374151', margin: '0 0 8px' }}>{tr.noAnnouncements}</p>
          <p style={{ color: '#64748b', margin: 0 }}>{tr.noAnnouncementsDesc}</p>
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          {/* Header row */}
          <div style={{ background: '#f8fafc', padding: '14px 24px', display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: '16px', alignItems: 'center', borderBottom: '1px solid #f1f5f9' }}>
            {[tr.colAnn, tr.colType, tr.colDate, tr.colActions].map((h) => (
              <span key={h} style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: isRTL ? 'right' : 'left' }}>{h}</span>
            ))}
          </div>
          {announcements.map((ann, i) => {
            const cfg = typeConfig[ann.type] ?? { label: ann.type, bg: '#f1f5f9', color: '#475569' }
            return (
              <div
                key={ann.id}
                style={{
                  padding: '18px 24px', display: 'grid', gridTemplateColumns: '1fr auto auto auto',
                  gap: '16px', alignItems: 'center',
                  borderBottom: i < announcements.length - 1 ? '1px solid #f8fafc' : 'none',
                  transition: 'background 0.15s',
                }}
                onMouseOver={(e) => ((e.currentTarget as HTMLDivElement).style.background = '#fafbff')}
                onMouseOut={(e) => ((e.currentTarget as HTMLDivElement).style.background = 'white')}
              >
                <div style={{ textAlign: isRTL ? 'right' : 'left' }}>
                  <p style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>{ann.title}</p>
                  <p style={{ margin: '0', fontSize: '12px', color: '#94a3b8' }}>
                    {tr.by.replace('{name}', ann.createdByName)} · {ann.content.substring(0, 60)}...
                  </p>
                </div>
                <span style={{ padding: '4px 12px', borderRadius: '999px', fontSize: '11px', fontWeight: '600', background: cfg.bg, color: cfg.color, whiteSpace: 'nowrap' }}>
                  {cfg.label}
                </span>
                <span style={{ fontSize: '12px', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                  {new Date(ann.createdAt).toLocaleDateString(isRTL ? 'ar-EG' : 'fr-FR')}
                </span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button style={{ padding: '6px 10px', borderRadius: '8px', background: '#f1f5f9', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    <Edit2 size={14} color="#64748b" />
                  </button>
                  <button style={{ padding: '6px 10px', borderRadius: '8px', background: '#fee2e2', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    <Trash2 size={14} color="#ef4444" />
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
