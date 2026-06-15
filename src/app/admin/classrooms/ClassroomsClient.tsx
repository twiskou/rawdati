'use client'

import { useState, useTransition } from 'react'
import {
  Plus, X, Edit2, Trash2, Users, User, ChevronDown,
  ChevronUp, BookOpen, AlertTriangle, CheckCircle,
} from 'lucide-react'

interface Teacher {
  id: string
  firstName: string
  lastName: string
}

interface Child {
  id: string
  firstName: string
  lastName: string
  gender: 'MALE' | 'FEMALE'
  birthDate: string
  photo: string | null
}

interface Classroom {
  id: string
  name: string
  description: string | null
  teacher: Teacher | null
  children: Child[]
  activities: { activityDate: string }[]
}

interface ClassroomsClientProps {
  classrooms: Classroom[]
  teachers: Teacher[]
}

const COLORS = [
  { bg: 'rgba(247,37,133,0.08)', border: '#F72585', light: '#fce7f3' },
  { bg: 'rgba(67,97,238,0.08)', border: '#4361EE', light: '#dbeafe' },
  { bg: 'rgba(16,185,129,0.08)', border: '#10b981', light: '#d1fae5' },
  { bg: 'rgba(245,158,11,0.08)', border: '#f59e0b', light: '#fef3c7' },
  { bg: 'rgba(139,92,246,0.08)', border: '#8b5cf6', light: '#ede9fe' },
]

export default function ClassroomsClient({ classrooms: initial, teachers }: ClassroomsClientProps) {
  const [classrooms, setClassrooms] = useState<Classroom[]>(initial)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  // Form modal
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [formName, setFormName] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [formTeacherId, setFormTeacherId] = useState('')

  // Delete confirm modal
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteName, setDeleteName] = useState('')

  // Students view modal
  const [viewStudentsFor, setViewStudentsFor] = useState<Classroom | null>(null)

  // Expanded card (mobile)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 14px',
    border: '1.5px solid #e2e8f0', borderRadius: '12px',
    fontSize: '14px', color: '#1e293b', background: '#f8fafc',
    outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
  }

  function showMsg(ok: boolean, text: string) {
    setMsg({ ok, text })
    setTimeout(() => setMsg(null), 3500)
  }

  function openCreate() {
    setEditId(null)
    setFormName(''); setFormDesc(''); setFormTeacherId('')
    setShowForm(true)
  }

  function openEdit(cls: Classroom) {
    setEditId(cls.id)
    setFormName(cls.name)
    setFormDesc(cls.description || '')
    setFormTeacherId(cls.teacher?.id || '')
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditId(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const method = editId ? 'PUT' : 'POST'
      const body = JSON.stringify({
        id: editId,
        name: formName,
        description: formDesc,
        teacherId: formTeacherId || null,
      })

      const res = await fetch('/api/admin/classrooms', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body,
      })

      if (res.ok) {
        const updated: Classroom = await res.json()
        if (editId) {
          setClassrooms(prev => prev.map(c => c.id === editId ? updated : c))
          showMsg(true, 'Classe modifiée avec succès !')
        } else {
          setClassrooms(prev => [...prev, updated])
          showMsg(true, 'Classe créée avec succès !')
        }
        closeForm()
      } else {
        const err = await res.json()
        showMsg(false, err.error || 'Erreur lors de l\'opération')
      }
    })
  }

  async function handleDelete() {
    if (!deleteId) return
    startTransition(async () => {
      const res = await fetch(`/api/admin/classrooms?id=${deleteId}`, { method: 'DELETE' })
      if (res.ok) {
        setClassrooms(prev => prev.filter(c => c.id !== deleteId))
        showMsg(true, `Classe "${deleteName}" supprimée.`)
      } else {
        const err = await res.json()
        showMsg(false, err.error || 'Erreur lors de la suppression')
      }
      setDeleteId(null)
    })
  }

  const getAge = (birthDate: string) => {
    const diff = Date.now() - new Date(birthDate).getTime()
    const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25))
    const months = Math.floor((diff / (1000 * 60 * 60 * 24 * 30.44)) % 12)
    return years > 0 ? `${years} an${years > 1 ? 's' : ''}` : `${months} mois`
  }

  return (
    <div style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", maxWidth: '1200px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.5px' }}>
            Classes
          </h1>
          <p style={{ fontSize: '15px', color: '#64748b', margin: 0 }}>
            {classrooms.length} classe{classrooms.length !== 1 ? 's' : ''} • {classrooms.reduce((n, c) => n + c.children.length, 0)} enfants
          </p>
        </div>
        <button
          onClick={openCreate}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px',
            background: 'linear-gradient(135deg, #F72585, #4361EE)',
            border: 'none', borderRadius: '12px', color: 'white',
            fontSize: '14px', fontWeight: '600', cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(247,37,133,0.3)',
            transition: 'opacity 0.15s, transform 0.1s',
          }}
          onMouseOver={e => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-1px)' }}
          onMouseOut={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)' }}
        >
          <Plus size={16} /> Nouvelle classe
        </button>
      </div>

      {/* Toast */}
      {msg && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '14px 18px', borderRadius: '12px', marginBottom: '20px',
          background: msg.ok ? '#d1fae5' : '#fee2e2',
          color: msg.ok ? '#059669' : '#dc2626',
          fontSize: '14px', fontWeight: '600',
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          animation: 'fadeIn 0.2s ease',
        }}>
          {msg.ok ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
          {msg.text}
        </div>
      )}

      {/* Stats row */}
      {classrooms.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px', marginBottom: '28px' }}>
          {[
            { label: 'Classes', value: classrooms.length, color: '#4361EE', icon: '🏫' },
            { label: 'Enseignants', value: classrooms.filter(c => c.teacher).length, color: '#F72585', icon: '👩‍🏫' },
            { label: 'Enfants inscrits', value: classrooms.reduce((n, c) => n + c.children.length, 0), color: '#10b981', icon: '👶' },
            { label: 'Moy. par classe', value: classrooms.length ? Math.round(classrooms.reduce((n, c) => n + c.children.length, 0) / classrooms.length) : 0, color: '#f59e0b', icon: '📊' },
          ].map(s => (
            <div key={s.label} style={{ background: 'white', borderRadius: '14px', padding: '16px 18px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '26px' }}>{s.icon}</span>
              <div>
                <p style={{ margin: 0, fontSize: '22px', fontWeight: '800', color: s.color }}>{s.value}</p>
                <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8', fontWeight: '500' }}>{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {classrooms.length === 0 ? (
        <div style={{ background: 'white', borderRadius: '24px', padding: '80px 60px', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <p style={{ fontSize: '72px', margin: '0 0 16px' }}>🏫</p>
          <p style={{ fontSize: '20px', fontWeight: '700', color: '#374151', margin: '0 0 8px' }}>Aucune classe créée</p>
          <p style={{ color: '#64748b', margin: '0 0 24px', fontSize: '15px' }}>Commencez par créer votre première classe</p>
          <button
            onClick={openCreate}
            style={{ padding: '12px 28px', background: 'linear-gradient(135deg, #F72585, #4361EE)', border: 'none', borderRadius: '12px', color: 'white', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
          >
            <Plus size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
            Créer une classe
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {classrooms.map((cls, i) => {
            const clr = COLORS[i % COLORS.length]
            const isExpanded = expandedId === cls.id
            return (
              <div
                key={cls.id}
                style={{
                  background: 'white', borderRadius: '20px',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                  overflow: 'hidden',
                  border: '1px solid rgba(0,0,0,0.04)',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                }}
                onMouseOver={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 28px rgba(0,0,0,0.1)' }}
                onMouseOut={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)' }}
              >
                {/* Color accent bar */}
                <div style={{ height: '5px', background: `linear-gradient(90deg, ${clr.border}, ${clr.border}66)` }} />

                <div style={{ padding: '22px' }}>
                  {/* Title row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                        <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: clr.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <BookOpen size={18} color={clr.border} />
                        </div>
                        <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '700', color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {cls.name}
                        </h3>
                      </div>
                      {cls.description && (
                        <p style={{ margin: '0 0 0 48px', fontSize: '12px', color: '#94a3b8', lineHeight: '1.4' }}>{cls.description}</p>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '4px', marginLeft: '8px', flexShrink: 0 }}>
                      <button
                        onClick={() => openEdit(cls)}
                        title="Modifier"
                        style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', background: '#f1f5f9', border: 'none', cursor: 'pointer', transition: 'background 0.15s' }}
                        onMouseOver={e => (e.currentTarget.style.background = '#e2e8f0')}
                        onMouseOut={e => (e.currentTarget.style.background = '#f1f5f9')}
                      >
                        <Edit2 size={14} color="#374151" />
                      </button>
                      <button
                        onClick={() => { setDeleteId(cls.id); setDeleteName(cls.name) }}
                        title="Supprimer"
                        style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', background: '#fee2e2', border: 'none', cursor: 'pointer', transition: 'background 0.15s' }}
                        onMouseOver={e => (e.currentTarget.style.background = '#fecaca')}
                        onMouseOut={e => (e.currentTarget.style.background = '#fee2e2')}
                      >
                        <Trash2 size={14} color="#ef4444" />
                      </button>
                    </div>
                  </div>

                  {/* Info rows */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                    {/* Teacher */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', background: '#f8fafc', borderRadius: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <User size={13} color="#94a3b8" />
                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>Éducatrice</span>
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: '600', color: cls.teacher ? '#374151' : '#cbd5e1' }}>
                        {cls.teacher ? `${cls.teacher.firstName} ${cls.teacher.lastName}` : 'Non assignée'}
                      </span>
                    </div>
                    {/* Children count */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', background: '#f8fafc', borderRadius: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Users size={13} color="#94a3b8" />
                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>Élèves</span>
                      </div>
                      <span style={{ fontSize: '18px', fontWeight: '800', color: clr.border }}>{cls.children.length}</span>
                    </div>
                    {/* Last activity */}
                    {cls.activities[0] && (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', background: '#f8fafc', borderRadius: '10px' }}>
                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>Dernière activité</span>
                        <span style={{ fontSize: '12px', fontWeight: '600', color: '#374151' }}>
                          {new Date(cls.activities[0].activityDate).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => setViewStudentsFor(cls)}
                      style={{
                        flex: 1, padding: '9px', borderRadius: '10px',
                        background: clr.bg, border: `1px solid ${clr.border}33`,
                        cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: clr.border,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                        transition: 'opacity 0.15s',
                      }}
                      onMouseOver={e => (e.currentTarget.style.opacity = '0.8')}
                      onMouseOut={e => (e.currentTarget.style.opacity = '1')}
                    >
                      <Users size={14} /> Voir élèves
                    </button>
                    <button
                      onClick={() => openEdit(cls)}
                      style={{
                        flex: 1, padding: '9px', borderRadius: '10px',
                        background: '#f1f5f9', border: 'none',
                        cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#374151',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                        transition: 'background 0.15s',
                      }}
                      onMouseOver={e => (e.currentTarget.style.background = '#e2e8f0')}
                      onMouseOut={e => (e.currentTarget.style.background = '#f1f5f9')}
                    >
                      <Edit2 size={14} /> Modifier
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ─── Create / Edit Modal ─── */}
      {showForm && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(4px)' }}
          onClick={closeForm}
        >
          <div
            style={{ background: 'white', borderRadius: '24px', padding: '36px', width: '100%', maxWidth: '500px', boxShadow: '0 32px 80px rgba(0,0,0,0.2)' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h2 style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>
                  {editId ? 'Modifier la classe' : 'Nouvelle classe'}
                </h2>
                <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>
                  {editId ? 'Modifiez les informations de la classe' : 'Remplissez les informations de la classe'}
                </p>
              </div>
              <button onClick={closeForm} style={{ background: '#f1f5f9', border: 'none', borderRadius: '10px', cursor: 'pointer', padding: '8px', display: 'flex' }}>
                <X size={20} color="#374151" />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Nom de la classe *
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  required
                  placeholder="Ex: Les Petits Lions"
                  style={inputStyle}
                  autoFocus
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Description
                </label>
                <textarea
                  value={formDesc}
                  onChange={e => setFormDesc(e.target.value)}
                  placeholder="Description optionnelle..."
                  rows={2}
                  style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.5' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Éducatrice / Enseignant
                </label>
                <select
                  value={formTeacherId}
                  onChange={e => setFormTeacherId(e.target.value)}
                  style={{ ...inputStyle, cursor: 'pointer' }}
                >
                  <option value="">— Non assigné —</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.firstName} {t.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px', paddingTop: '4px' }}>
                <button
                  type="button"
                  onClick={closeForm}
                  style={{ flex: 1, padding: '13px', border: '1.5px solid #e2e8f0', borderRadius: '12px', background: 'white', fontSize: '14px', fontWeight: '600', cursor: 'pointer', color: '#374151' }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  style={{
                    flex: 2, padding: '13px',
                    background: isPending ? '#9ca3af' : 'linear-gradient(135deg, #F72585, #4361EE)',
                    border: 'none', borderRadius: '12px', color: 'white',
                    fontSize: '14px', fontWeight: '600',
                    cursor: isPending ? 'not-allowed' : 'pointer',
                    boxShadow: isPending ? 'none' : '0 4px 14px rgba(247,37,133,0.3)',
                  }}
                >
                  {isPending ? 'Enregistrement...' : (editId ? '✅ Enregistrer' : '✨ Créer la classe')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Delete Confirm Modal ─── */}
      {deleteId && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(4px)' }}
          onClick={() => setDeleteId(null)}
        >
          <div
            style={{ background: 'white', borderRadius: '24px', padding: '36px', width: '100%', maxWidth: '420px', boxShadow: '0 32px 80px rgba(0,0,0,0.2)', textAlign: 'center' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Trash2 size={28} color="#ef4444" />
            </div>
            <h2 style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>
              Supprimer la classe ?
            </h2>
            <p style={{ margin: '0 0 8px', fontSize: '15px', color: '#374151', fontWeight: '600' }}>"{deleteName}"</p>
            <p style={{ margin: '0 0 28px', fontSize: '13px', color: '#94a3b8', lineHeight: '1.5' }}>
              Cette action est irréversible. Tous les enfants et activités liés à cette classe seront dissociés.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setDeleteId(null)}
                style={{ flex: 1, padding: '13px', border: '1.5px solid #e2e8f0', borderRadius: '12px', background: 'white', fontSize: '14px', fontWeight: '600', cursor: 'pointer', color: '#374151' }}
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={isPending}
                style={{ flex: 1, padding: '13px', background: isPending ? '#9ca3af' : '#ef4444', border: 'none', borderRadius: '12px', color: 'white', fontSize: '14px', fontWeight: '700', cursor: isPending ? 'not-allowed' : 'pointer' }}
              >
                {isPending ? 'Suppression...' : '🗑️ Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── View Students Modal ─── */}
      {viewStudentsFor && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(4px)' }}
          onClick={() => setViewStudentsFor(null)}
        >
          <div
            style={{ background: 'white', borderRadius: '24px', padding: '36px', width: '100%', maxWidth: '580px', maxHeight: '80vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 32px 80px rgba(0,0,0,0.2)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexShrink: 0 }}>
              <div>
                <h2 style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>
                  {viewStudentsFor.name}
                </h2>
                <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>
                  {viewStudentsFor.children.length} élève{viewStudentsFor.children.length !== 1 ? 's' : ''}
                  {viewStudentsFor.teacher && ` · ${viewStudentsFor.teacher.firstName} ${viewStudentsFor.teacher.lastName}`}
                </p>
              </div>
              <button onClick={() => setViewStudentsFor(null)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '10px', cursor: 'pointer', padding: '8px', display: 'flex' }}>
                <X size={20} color="#374151" />
              </button>
            </div>

            {/* Student list */}
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {viewStudentsFor.children.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <p style={{ fontSize: '48px', margin: '0 0 12px' }}>👶</p>
                  <p style={{ fontSize: '15px', fontWeight: '600', color: '#374151', margin: '0 0 6px' }}>Aucun élève dans cette classe</p>
                  <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>Assignez des enfants depuis la page Enfants</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {viewStudentsFor.children.map((child, idx) => (
                    <div
                      key={child.id}
                      style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 14px', background: '#f8fafc', borderRadius: '12px', transition: 'background 0.15s' }}
                      onMouseOver={e => (e.currentTarget.style.background = '#f1f5f9')}
                      onMouseOut={e => (e.currentTarget.style.background = '#f8fafc')}
                    >
                      <span style={{ fontSize: '13px', color: '#cbd5e1', fontWeight: '700', width: '24px', textAlign: 'center' }}>
                        {idx + 1}
                      </span>
                      <div style={{
                        width: '40px', height: '40px', borderRadius: '50%',
                        background: child.gender === 'MALE'
                          ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
                          : 'linear-gradient(135deg, #ec4899, #be185d)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '15px', fontWeight: '700', color: 'white', flexShrink: 0, overflow: 'hidden',
                      }}>
                        {child.photo
                          ? <img src={child.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : `${child.firstName[0]}${child.lastName[0]}`
                        }
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: '0 0 2px', fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>
                          {child.firstName} {child.lastName}
                        </p>
                        <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8' }}>
                          {getAge(child.birthDate)}
                        </p>
                      </div>
                      <span style={{
                        fontSize: '11px', fontWeight: '600', padding: '3px 10px', borderRadius: '999px',
                        background: child.gender === 'MALE' ? '#dbeafe' : '#fce7f3',
                        color: child.gender === 'MALE' ? '#2563eb' : '#be185d',
                      }}>
                        {child.gender === 'MALE' ? '👦 Garçon' : '👧 Fille'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  )
}
