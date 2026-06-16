'use client'

import { useState, useTransition, useMemo } from 'react'
import {
  Plus, X, Search, UserCheck, UserX, Edit2, Trash2,
  AlertTriangle, CheckCircle, Eye, EyeOff, Users, GraduationCap, UserPlus,
} from 'lucide-react'
import { useLanguage } from '@/lib/i18n/LanguageContext'

interface Classroom { id: string; name: string }

interface Child { id: string; firstName: string; lastName: string }

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: 'TEACHER' | 'PARENT'
  phone: string | null
  isActive: boolean
  createdAt: string
  taughtClasses: Classroom[]
  parentChildren: { child: Child }[]
}

interface UsersClientProps {
  users: User[]
  classrooms: Classroom[]
}

export default function UsersClient({ users: initial, classrooms }: UsersClientProps) {
  const [users, setUsers] = useState(initial)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const [isPending, startTransition] = useTransition()
  
  const { t, isRTL } = useLanguage()
  const tr = t.admin.users

  const ROLE_CFG = {
    TEACHER: { label: tr.teachers, bg: '#d1fae5', color: '#059669', icon: '👩‍🏫' },
    PARENT: { label: tr.parents, bg: '#dbeafe', color: '#2563eb', icon: '👨‍👩‍👧' },
  }

  // Form modal
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [formRole, setFormRole] = useState<'TEACHER' | 'PARENT'>('PARENT')
  const [formFirst, setFormFirst] = useState('')
  const [formLast, setFormLast] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formPhone, setFormPhone] = useState('')
  const [formPassword, setFormPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [formClassroomId, setFormClassroomId] = useState('')

  // Delete modal
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteName, setDeleteName] = useState('')

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '11px 14px',
    border: '1.5px solid #e2e8f0', borderRadius: '10px',
    fontSize: '14px', color: '#1e293b', background: '#f8fafc',
    outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
  }

  function flash(ok: boolean, text: string) {
    setMsg({ ok, text })
    setTimeout(() => setMsg(null), 3500)
  }

  const filtered = useMemo(() => users.filter(u => {
    if (roleFilter && u.role !== roleFilter) return false
    if (search) {
      const q = search.toLowerCase()
      return `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(q)
    }
    return true
  }), [users, search, roleFilter])

  function openCreate(defaultRole: 'TEACHER' | 'PARENT' = 'PARENT') {
    setEditId(null)
    setFormRole(defaultRole)
    setFormFirst(''); setFormLast(''); setFormEmail('')
    setFormPhone(''); setFormPassword(''); setFormClassroomId('')
    setShowForm(true)
  }

  function openEdit(u: User) {
    setEditId(u.id)
    setFormRole(u.role)
    setFormFirst(u.firstName); setFormLast(u.lastName)
    setFormEmail(u.email); setFormPhone(u.phone || '')
    setFormPassword(''); setFormClassroomId(u.taughtClasses[0]?.id || '')
    setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const method = editId ? 'PUT' : 'POST'
      const body: Record<string, unknown> = {
        id: editId,
        firstName: formFirst,
        lastName: formLast,
        email: formEmail,
        phone: formPhone,
        role: formRole,
        classroomId: formRole === 'TEACHER' ? formClassroomId || null : null,
      }
      if (!editId) body.password = formPassword

      const res = await fetch('/api/admin/users', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        const data: User = await res.json()
        if (editId) {
          setUsers(prev => prev.map(u => u.id === editId ? data : u))
          flash(true, 'Utilisateur modifié avec succès !')
        } else {
          setUsers(prev => [data, ...prev])
          flash(true, `Compte ${ROLE_CFG[formRole].label} créé — Email: ${formEmail}`)
        }
        setShowForm(false)
      } else {
        const err = await res.json()
        flash(false, err.error || 'Erreur')
      }
    })
  }

  async function toggleActive(u: User) {
    const newState = !u.isActive
    setUsers(prev => prev.map(x => x.id === u.id ? { ...x, isActive: newState } : x))
    const res = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: u.id, isActive: newState }),
    })
    if (!res.ok) {
      setUsers(prev => prev.map(x => x.id === u.id ? { ...x, isActive: u.isActive } : x))
      flash(false, 'Erreur lors de la mise à jour')
    } else {
      flash(true, newState ? `${u.firstName} activé(e)` : `${u.firstName} désactivé(e)`)
    }
  }

  async function handleDelete() {
    if (!deleteId) return
    startTransition(async () => {
      const res = await fetch(`/api/admin/users?id=${deleteId}`, { method: 'DELETE' })
      if (res.ok) {
        setUsers(prev => prev.filter(u => u.id !== deleteId))
        flash(true, `${deleteName} supprimé(e)`)
      } else {
        flash(false, 'Erreur lors de la suppression')
      }
      setDeleteId(null)
    })
  }

  const teachers = users.filter(u => u.role === 'TEACHER')
  const parents = users.filter(u => u.role === 'PARENT')

  return (
    <div style={{ fontFamily: "'Inter','Segoe UI',sans-serif", maxWidth: '1200px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.5px' }}>
            {tr.title}
          </h1>
          <p style={{ fontSize: '15px', color: '#64748b', margin: 0 }}>
            {tr.subtitle.replace('{teachers}', teachers.length.toString()).replace('{parents}', parents.length.toString())}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => openCreate('TEACHER')}
            style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '11px 18px', background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', borderRadius: '12px', color: 'white', fontSize: '14px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 12px rgba(16,185,129,0.3)', transition: 'opacity 0.15s' }}
            onMouseOver={e => (e.currentTarget.style.opacity = '0.9')}
            onMouseOut={e => (e.currentTarget.style.opacity = '1')}
          >
            <GraduationCap size={15} /> {tr.addTeacher}
          </button>
          <button
            onClick={() => openCreate('PARENT')}
            style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '11px 18px', background: 'linear-gradient(135deg, #F72585, #4361EE)', border: 'none', borderRadius: '12px', color: 'white', fontSize: '14px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 12px rgba(247,37,133,0.3)', transition: 'opacity 0.15s' }}
            onMouseOver={e => (e.currentTarget.style.opacity = '0.9')}
            onMouseOut={e => (e.currentTarget.style.opacity = '1')}
          >
            <UserPlus size={15} /> {tr.addParent}
          </button>
        </div>
      </div>

      {/* Toast */}
      {msg && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 18px', borderRadius: '12px', marginBottom: '16px', background: msg.ok ? '#d1fae5' : '#fee2e2', color: msg.ok ? '#059669' : '#dc2626', fontSize: '14px', fontWeight: '600', animation: 'fadeIn 0.2s ease' }}>
          {msg.ok ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
          {msg.text}
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        {[
          { label: tr.teachers, value: teachers.length, color: '#059669', icon: '👩‍🏫', bg: '#d1fae5' },
          { label: tr.parents, value: parents.length, color: '#2563eb', icon: '👨‍👩‍👧', bg: '#dbeafe' },
          { label: tr.activeAccounts, value: users.filter(u => u.isActive).length, color: '#10b981', icon: '✅', bg: '#d1fae5' },
          { label: tr.inactiveAccounts, value: users.filter(u => !u.isActive).length, color: '#ef4444', icon: '⛔', bg: '#fee2e2' },
        ].map(s => (
          <div key={s.label} style={{ background: 'white', borderRadius: '14px', padding: '16px 18px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>{s.icon}</div>
            <div>
              <p style={{ margin: 0, fontSize: '22px', fontWeight: '800', color: s.color }}>{s.value}</p>
              <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8', fontWeight: '500' }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '14px 18px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: '20px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
          <Search size={15} color="#94a3b8" style={{ position: 'absolute', [isRTL ? 'right' : 'left']: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={tr.search}
            style={{ ...inputStyle, paddingLeft: isRTL ? '14px' : '36px', paddingRight: isRTL ? '36px' : '14px' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {([['', tr.all], ['TEACHER', `👩‍🏫 ${tr.teachers}`], ['PARENT', `👨‍👩‍👧 ${tr.parents}`]] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setRoleFilter(key)}
              style={{ padding: '9px 16px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600', background: roleFilter === key ? 'linear-gradient(135deg, #F72585, #4361EE)' : '#f1f5f9', color: roleFilter === key ? 'white' : '#64748b', transition: 'all 0.15s' }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <p style={{ fontSize: '48px', margin: '0 0 12px' }}>👤</p>
            <p style={{ fontSize: '16px', fontWeight: '600', color: '#374151', margin: '0 0 6px' }}>{tr.noUsers}</p>
            <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>{tr.noUsersDesc}</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                {[tr.colUser, tr.colContact, tr.colRole, tr.colClasses, tr.colStatus, tr.colActions].map(h => (
                  <th key={h} style={{ padding: '13px 16px', textAlign: isRTL ? 'right' : 'left', fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => {
                const rc = ROLE_CFG[u.role]
                return (
                  <tr
                    key={u.id}
                    style={{ borderBottom: i < filtered.length - 1 ? '1px solid #f8fafc' : 'none', transition: 'background 0.15s', background: 'white' }}
                    onMouseOver={e => (e.currentTarget.style.background = '#fafbff')}
                    onMouseOut={e => (e.currentTarget.style.background = 'white')}
                  >
                    {/* Avatar + name */}
                    <td style={{ padding: '13px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: u.role === 'TEACHER' ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #F72585, #4361EE)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '700', color: 'white', flexShrink: 0 }}>
                          {u.firstName[0]}{u.lastName[0]}
                        </div>
                        <div>
                          <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>{u.firstName} {u.lastName}</p>
                          <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8' }}>{tr.addedOn.replace('{date}', new Date(u.createdAt).toLocaleDateString(isRTL ? 'ar-EG' : 'fr-FR'))}</p>
                        </div>
                      </div>
                    </td>
                    {/* Email / phone */}
                    <td style={{ padding: '13px 16px' }}>
                      <p style={{ margin: '0 0 2px', fontSize: '13px', color: '#374151' }}>{u.email}</p>
                      {u.phone && <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8' }}>{u.phone}</p>}
                    </td>
                    {/* Role badge */}
                    <td style={{ padding: '13px 16px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: '700', background: rc.bg, color: rc.color, whiteSpace: 'nowrap' }}>
                        {rc.icon} {rc.label}
                      </span>
                    </td>
                    {/* Class or children */}
                    <td style={{ padding: '13px 16px' }}>
                      {u.role === 'TEACHER' ? (
                        u.taughtClasses.length > 0
                          ? <span style={{ fontSize: '13px', fontWeight: '600', color: '#059669' }}>📚 {u.taughtClasses.map(c => c.name).join(', ')}</span>
                          : <span style={{ fontSize: '12px', color: '#cbd5e1', fontStyle: 'italic' }}>{tr.unassigned}</span>
                      ) : (
                        u.parentChildren.length > 0
                          ? <span style={{ fontSize: '12px', color: '#374151' }}>👶 {u.parentChildren.map(p => p.child.firstName).join(', ')}</span>
                          : <span style={{ fontSize: '12px', color: '#cbd5e1', fontStyle: 'italic' }}>{tr.noChild}</span>
                      )}
                    </td>
                    {/* Status */}
                    <td style={{ padding: '13px 16px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: '600', color: u.isActive ? '#10b981' : '#ef4444' }}>
                        {u.isActive ? <UserCheck size={14} /> : <UserX size={14} />}
                        {u.isActive ? tr.active : tr.inactive}
                      </span>
                    </td>
                    {/* Actions */}
                    <td style={{ padding: '13px 16px' }}>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => openEdit(u)}
                          style={{ padding: '6px 10px', borderRadius: '8px', background: '#f1f5f9', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '500', color: '#374151' }}
                          onMouseOver={e => (e.currentTarget.style.background = '#e2e8f0')}
                          onMouseOut={e => (e.currentTarget.style.background = '#f1f5f9')}
                        >
                          <Edit2 size={12} /> {tr.edit}
                        </button>
                        <button
                          onClick={() => toggleActive(u)}
                          style={{ padding: '6px 10px', borderRadius: '8px', background: u.isActive ? '#fee2e2' : '#d1fae5', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: '500', color: u.isActive ? '#ef4444' : '#059669' }}
                        >
                          {u.isActive ? tr.deactivate : tr.activate}
                        </button>
                        <button
                          onClick={() => { setDeleteId(u.id); setDeleteName(`${u.firstName} ${u.lastName}`) }}
                          style={{ padding: '6px 8px', borderRadius: '8px', background: '#fee2e2', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                          onMouseOver={e => (e.currentTarget.style.background = '#fecaca')}
                          onMouseOut={e => (e.currentTarget.style.background = '#fee2e2')}
                        >
                          <Trash2 size={13} color="#ef4444" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ─── Create / Edit Modal ─── */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(4px)' }} onClick={() => setShowForm(false)}>
          <div style={{ background: 'white', borderRadius: '24px', padding: '36px', width: '100%', maxWidth: '520px', boxShadow: '0 32px 80px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            {/* Modal header with role tabs */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <h2 style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>
                  {editId ? tr.editUserTitle : tr.newUserTitle}
                </h2>
                <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>
                  {editId ? tr.editUserDesc : tr.newUserDesc}
                </p>
              </div>
              <button onClick={() => setShowForm(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '10px', cursor: 'pointer', padding: '8px', display: 'flex' }}>
                <X size={20} color="#374151" />
              </button>
            </div>

            {/* Role selector (only on create) */}
            {!editId && (
              <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', padding: '4px', background: '#f1f5f9', borderRadius: '12px' }}>
                {(['PARENT', 'TEACHER'] as const).map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setFormRole(r)}
                    style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '700', transition: 'all 0.15s', background: formRole === r ? (r === 'TEACHER' ? '#059669' : '#4361EE') : 'transparent', color: formRole === r ? 'white' : '#64748b' }}
                  >
                    {ROLE_CFG[r].icon} {ROLE_CFG[r].label}
                  </button>
                ))}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#374151', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: isRTL ? 'right' : 'left' }}>{tr.firstName}</label>
                  <input type="text" value={formFirst} onChange={e => setFormFirst(e.target.value)} required placeholder="Amina" style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#374151', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: isRTL ? 'right' : 'left' }}>{tr.lastName}</label>
                  <input type="text" value={formLast} onChange={e => setFormLast(e.target.value)} required placeholder="Bensalem" style={inputStyle} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#374151', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: isRTL ? 'right' : 'left' }}>{tr.emailLabel} {editId && <span style={{ fontWeight: '400', color: '#94a3b8', textTransform: 'none' }}>{tr.emailUneditable}</span>}</label>
                <input type="email" value={formEmail} onChange={e => setFormEmail(e.target.value)} required disabled={!!editId} placeholder="email@exemple.com" style={{ ...inputStyle, opacity: editId ? 0.6 : 1, textAlign: isRTL ? 'right' : 'left' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#374151', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: isRTL ? 'right' : 'left' }}>{tr.phoneLabel}</label>
                <input type="tel" value={formPhone} onChange={e => setFormPhone(e.target.value)} placeholder="+213 XXX XXX XXX" style={{ ...inputStyle, textAlign: isRTL ? 'right' : 'left' }} />
              </div>

              {!editId && (
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#374151', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: isRTL ? 'right' : 'left' }}>{tr.passwordLabel}</label>
                  <div style={{ position: 'relative' }}>
                    <input type={showPwd ? 'text' : 'password'} value={formPassword} onChange={e => setFormPassword(e.target.value)} required minLength={6} placeholder="••••••••" style={{ ...inputStyle, paddingRight: isRTL ? '14px' : '44px', paddingLeft: isRTL ? '44px' : '14px', textAlign: isRTL ? 'right' : 'left' }} />
                    <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', [isRTL ? 'left' : 'right']: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex' }}>
                      {showPwd ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>
              )}

              {/* Teacher: assign classroom */}
              {formRole === 'TEACHER' && (
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#374151', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: isRTL ? 'right' : 'left' }}>{tr.assignedClass}</label>
                  <select value={formClassroomId} onChange={e => setFormClassroomId(e.target.value)} style={{ ...inputStyle, cursor: 'pointer', textAlign: isRTL ? 'right' : 'left' }}>
                    <option value="">{tr.noClass}</option>
                    {classrooms.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Info box */}
              <div style={{ padding: '12px 14px', borderRadius: '10px', background: formRole === 'TEACHER' ? 'rgba(16,185,129,0.06)' : 'rgba(67,97,238,0.06)', border: `1px solid ${formRole === 'TEACHER' ? 'rgba(16,185,129,0.2)' : 'rgba(67,97,238,0.2)'}` }}>
                <p style={{ margin: 0, fontSize: '12px', color: formRole === 'TEACHER' ? '#059669' : '#4361EE', fontWeight: '500', lineHeight: '1.5', textAlign: isRTL ? 'right' : 'left' }}>
                  {formRole === 'TEACHER' ? tr.teacherInfo : tr.parentInfo}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px', paddingTop: '4px' }}>
                <button type="button" onClick={() => setShowForm(false)} style={{ flex: 1, padding: '12px', border: '1.5px solid #e2e8f0', borderRadius: '12px', background: 'white', fontSize: '14px', fontWeight: '600', cursor: 'pointer', color: '#374151' }}>
                  {tr.cancel}
                </button>
                <button type="submit" disabled={isPending} style={{ flex: 2, padding: '12px', background: isPending ? '#9ca3af' : (formRole === 'TEACHER' ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #F72585, #4361EE)'), border: 'none', borderRadius: '12px', color: 'white', fontSize: '14px', fontWeight: '700', cursor: isPending ? 'not-allowed' : 'pointer', boxShadow: isPending ? 'none' : '0 4px 14px rgba(0,0,0,0.2)' }}>
                  {isPending ? tr.saving : (editId ? tr.save : tr.createBtn.replace('{role}', ROLE_CFG[formRole].label))}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Delete Modal ─── */}
      {deleteId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(4px)' }} onClick={() => setDeleteId(null)}>
          <div style={{ background: 'white', borderRadius: '24px', padding: '36px', width: '100%', maxWidth: '400px', boxShadow: '0 32px 80px rgba(0,0,0,0.2)', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Trash2 size={28} color="#ef4444" />
            </div>
            <h2 style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>{tr.deleteUserTitle}</h2>
            <p style={{ margin: '0 0 6px', fontSize: '15px', color: '#374151', fontWeight: '600' }}>{deleteName}</p>
            <p style={{ margin: '0 0 28px', fontSize: '13px', color: '#94a3b8' }}>{tr.deleteWarning}</p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setDeleteId(null)} style={{ flex: 1, padding: '12px', border: '1.5px solid #e2e8f0', borderRadius: '12px', background: 'white', fontSize: '14px', fontWeight: '600', cursor: 'pointer', color: '#374151' }}>
                {tr.cancel}
              </button>
              <button onClick={handleDelete} disabled={isPending} style={{ flex: 1, padding: '12px', background: isPending ? '#9ca3af' : '#ef4444', border: 'none', borderRadius: '12px', color: 'white', fontSize: '14px', fontWeight: '700', cursor: isPending ? 'not-allowed' : 'pointer' }}>
                {isPending ? tr.deleting : tr.deleteConfirm}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  )
}
