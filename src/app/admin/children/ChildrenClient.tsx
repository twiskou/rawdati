'use client'

import { useState, useTransition, useMemo } from 'react'
import {
  Plus, X, Edit2, Trash2, Search, AlertTriangle,
  CheckCircle, Users, Baby,
} from 'lucide-react'

interface Classroom { id: string; name: string }
interface Parent { id: string; firstName: string; lastName: string; email: string }
interface Child {
  id: string
  firstName: string
  lastName: string
  gender: 'MALE' | 'FEMALE'
  birthDate: string
  photo: string | null
  allergies: string | null
  medicalNotes: string | null
  classroom: { id: string; name: string } | null
  parents: { parent: Parent }[]
}

interface ChildrenClientProps {
  children: Child[]
  classrooms: Classroom[]
  parents: Parent[]
}

export default function ChildrenClient({ children: initial, classrooms, parents }: ChildrenClientProps) {
  const [children, setChildren] = useState<Child[]>(initial)
  const [search, setSearch] = useState('')
  const [classroomFilter, setClassroomFilter] = useState('')
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  // Form modal
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [formFirst, setFormFirst] = useState('')
  const [formLast, setFormLast] = useState('')
  const [formBirth, setFormBirth] = useState('')
  const [formGender, setFormGender] = useState<'MALE' | 'FEMALE'>('MALE')
  const [formClassroomId, setFormClassroomId] = useState('')
  const [formAllergies, setFormAllergies] = useState('')
  const [formMedical, setFormMedical] = useState('')
  const [formParentIds, setFormParentIds] = useState<string[]>([])

  // Delete
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteName, setDeleteName] = useState('')

  // Detail view
  const [detailChild, setDetailChild] = useState<Child | null>(null)

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

  const filtered = useMemo(() => children.filter(c => {
    if (classroomFilter && c.classroom?.id !== classroomFilter) return false
    if (search) {
      const q = search.toLowerCase()
      return `${c.firstName} ${c.lastName}`.toLowerCase().includes(q)
    }
    return true
  }), [children, search, classroomFilter])

  function getAge(birth: string) {
    const ms = Date.now() - new Date(birth).getTime()
    const yrs = Math.floor(ms / (1000 * 60 * 60 * 24 * 365.25))
    const mos = Math.floor((ms / (1000 * 60 * 60 * 24 * 30.44)) % 12)
    return yrs > 0 ? `${yrs} an${yrs > 1 ? 's' : ''}` : `${mos} mois`
  }

  function openCreate() {
    setEditId(null)
    setFormFirst(''); setFormLast(''); setFormBirth('')
    setFormGender('MALE'); setFormClassroomId('')
    setFormAllergies(''); setFormMedical(''); setFormParentIds([])
    setShowForm(true)
  }

  function openEdit(c: Child) {
    setEditId(c.id)
    setFormFirst(c.firstName); setFormLast(c.lastName)
    setFormBirth(c.birthDate.split('T')[0])
    setFormGender(c.gender); setFormClassroomId(c.classroom?.id || '')
    setFormAllergies(c.allergies || ''); setFormMedical(c.medicalNotes || '')
    setFormParentIds(c.parents.map(p => p.parent.id))
    setShowForm(true)
  }

  function toggleParent(id: string) {
    setFormParentIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const method = editId ? 'PUT' : 'POST'
      const body = {
        id: editId,
        firstName: formFirst,
        lastName: formLast,
        birthDate: formBirth,
        gender: formGender,
        classroomId: formClassroomId || null,
        allergies: formAllergies || null,
        medicalNotes: formMedical || null,
        parentIds: formParentIds,
      }

      const res = await fetch('/api/admin/children', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        const data: Child = await res.json()
        if (editId) {
          setChildren(prev => prev.map(c => c.id === editId ? data : c))
          flash(true, 'Enfant modifié avec succès !')
        } else {
          setChildren(prev => [...prev, data])
          flash(true, `${formFirst} ${formLast} ajouté(e) !`)
        }
        setShowForm(false)
      } else {
        const err = await res.json()
        flash(false, err.error || 'Erreur')
      }
    })
  }

  async function handleDelete() {
    if (!deleteId) return
    startTransition(async () => {
      const res = await fetch(`/api/admin/children?id=${deleteId}`, { method: 'DELETE' })
      if (res.ok) {
        setChildren(prev => prev.filter(c => c.id !== deleteId))
        flash(true, `${deleteName} supprimé(e)`)
      } else {
        flash(false, 'Erreur lors de la suppression')
      }
      setDeleteId(null)
    })
  }

  return (
    <div style={{ fontFamily: "'Inter','Segoe UI',sans-serif", maxWidth: '1200px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.5px' }}>Enfants</h1>
          <p style={{ fontSize: '15px', color: '#64748b', margin: 0 }}>
            {children.length} enfant{children.length !== 1 ? 's' : ''} inscrit{children.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={openCreate}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', background: 'linear-gradient(135deg, #F72585, #4361EE)', border: 'none', borderRadius: '12px', color: 'white', fontSize: '14px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 14px rgba(247,37,133,0.3)', transition: 'opacity 0.15s' }}
          onMouseOver={e => (e.currentTarget.style.opacity = '0.9')}
          onMouseOut={e => (e.currentTarget.style.opacity = '1')}
        >
          <Plus size={16} /> Ajouter un enfant
        </button>
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
          { label: 'Total enfants', value: children.length, color: '#4361EE', icon: '👶' },
          { label: 'Garçons', value: children.filter(c => c.gender === 'MALE').length, color: '#2563eb', icon: '👦' },
          { label: 'Filles', value: children.filter(c => c.gender === 'FEMALE').length, color: '#be185d', icon: '👧' },
          { label: 'Sans classe', value: children.filter(c => !c.classroom).length, color: '#f59e0b', icon: '⚠️' },
          { label: 'Allergies', value: children.filter(c => c.allergies).length, color: '#ef4444', icon: '🚨' },
        ].map(s => (
          <div key={s.label} style={{ background: 'white', borderRadius: '14px', padding: '14px 16px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px' }}>{s.icon}</span>
            <div>
              <p style={{ margin: 0, fontSize: '22px', fontWeight: '800', color: s.color }}>{s.value}</p>
              <p style={{ margin: 0, fontSize: '10px', color: '#94a3b8', fontWeight: '500' }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '14px 18px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: '20px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un enfant..." style={{ ...inputStyle, paddingLeft: '36px' }} />
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button onClick={() => setClassroomFilter('')} style={{ padding: '8px 14px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600', background: !classroomFilter ? 'linear-gradient(135deg, #F72585, #4361EE)' : '#f1f5f9', color: !classroomFilter ? 'white' : '#64748b' }}>
            Tous
          </button>
          {classrooms.map(c => (
            <button key={c.id} onClick={() => setClassroomFilter(c.id)} style={{ padding: '8px 14px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600', background: classroomFilter === c.id ? 'linear-gradient(135deg, #F72585, #4361EE)' : '#f1f5f9', color: classroomFilter === c.id ? 'white' : '#64748b' }}>
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Cards grid */}
      {filtered.length === 0 ? (
        <div style={{ background: 'white', borderRadius: '24px', padding: '80px 60px', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <p style={{ fontSize: '72px', margin: '0 0 16px' }}>👶</p>
          <p style={{ fontSize: '20px', fontWeight: '700', color: '#374151', margin: '0 0 8px' }}>Aucun enfant inscrit</p>
          <p style={{ color: '#64748b', margin: '0 0 24px', fontSize: '15px' }}>Ajoutez des enfants et liez-les à leurs parents</p>
          <button onClick={openCreate} style={{ padding: '12px 28px', background: 'linear-gradient(135deg, #F72585, #4361EE)', border: 'none', borderRadius: '12px', color: 'white', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
            <Plus size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
            Ajouter un enfant
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {filtered.map(child => (
            <div
              key={child.id}
              style={{ background: 'white', borderRadius: '20px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.04)', transition: 'transform 0.15s, box-shadow 0.15s' }}
              onMouseOver={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)' }}
              onMouseOut={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)' }}
            >
              {/* Avatar + name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: child.gender === 'MALE' ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' : 'linear-gradient(135deg, #ec4899, #be185d)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '700', color: 'white', flexShrink: 0, overflow: 'hidden' }}>
                  {child.photo ? <img src={child.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : `${child.firstName[0]}${child.lastName[0]}`}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: '0 0 3px', fontSize: '15px', fontWeight: '700', color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {child.firstName} {child.lastName}
                  </p>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '999px', background: child.gender === 'MALE' ? '#dbeafe' : '#fce7f3', color: child.gender === 'MALE' ? '#2563eb' : '#be185d' }}>
                      {child.gender === 'MALE' ? '👦' : '👧'}
                    </span>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>{getAge(child.birthDate)}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                  <button onClick={() => openEdit(child)} style={{ width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', background: '#f1f5f9', border: 'none', cursor: 'pointer' }} onMouseOver={e => (e.currentTarget.style.background = '#e2e8f0')} onMouseOut={e => (e.currentTarget.style.background = '#f1f5f9')}>
                    <Edit2 size={13} color="#374151" />
                  </button>
                  <button onClick={() => { setDeleteId(child.id); setDeleteName(`${child.firstName} ${child.lastName}`) }} style={{ width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', background: '#fee2e2', border: 'none', cursor: 'pointer' }} onMouseOver={e => (e.currentTarget.style.background = '#fecaca')} onMouseOut={e => (e.currentTarget.style.background = '#fee2e2')}>
                    <Trash2 size={13} color="#ef4444" />
                  </button>
                </div>
              </div>

              {/* Info rows */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', background: '#f8fafc', borderRadius: '8px' }}>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>Classe</span>
                  <span style={{ fontSize: '12px', fontWeight: '600', color: child.classroom ? '#059669' : '#f59e0b' }}>
                    {child.classroom?.name ?? '⚠️ Non assigné'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', background: '#f8fafc', borderRadius: '8px' }}>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>Naissance</span>
                  <span style={{ fontSize: '12px', fontWeight: '600', color: '#374151' }}>
                    {new Date(child.birthDate).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', background: '#f8fafc', borderRadius: '8px' }}>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>Parent(s)</span>
                  <span style={{ fontSize: '12px', fontWeight: '600', color: child.parents.length > 0 ? '#374151' : '#cbd5e1', fontStyle: child.parents.length === 0 ? 'italic' : 'normal' }}>
                    {child.parents.length > 0 ? child.parents.map(p => p.parent.firstName).join(', ') : 'Aucun'}
                  </span>
                </div>
              </div>

              {/* Allergy alert */}
              {child.allergies && (
                <div style={{ padding: '8px 12px', background: '#fef2f2', borderRadius: '8px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertTriangle size={13} color="#dc2626" />
                  <p style={{ margin: 0, fontSize: '11px', color: '#dc2626', fontWeight: '600' }}>
                    Allergie: {child.allergies}
                  </p>
                </div>
              )}

              {/* Action button */}
              <button onClick={() => setDetailChild(child)} style={{ width: '100%', padding: '9px', borderRadius: '10px', background: 'rgba(67,97,238,0.07)', border: '1px solid rgba(67,97,238,0.15)', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#4361EE', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: 'opacity 0.15s' }} onMouseOver={e => (e.currentTarget.style.opacity = '0.8')} onMouseOut={e => (e.currentTarget.style.opacity = '1')}>
                <Baby size={14} /> Voir détails
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ─── Create / Edit Modal ─── */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(4px)' }} onClick={() => setShowForm(false)}>
          <div style={{ background: 'white', borderRadius: '24px', padding: '36px', width: '100%', maxWidth: '560px', boxShadow: '0 32px 80px rgba(0,0,0,0.2)', maxHeight: '92vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div>
                <h2 style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>{editId ? 'Modifier l\'enfant' : 'Ajouter un enfant'}</h2>
                <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>Remplissez les informations et liez aux parents</p>
              </div>
              <button onClick={() => setShowForm(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '10px', cursor: 'pointer', padding: '8px', display: 'flex' }}>
                <X size={20} color="#374151" />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Name row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#374151', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Prénom *</label>
                  <input type="text" value={formFirst} onChange={e => setFormFirst(e.target.value)} required placeholder="Rania" style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#374151', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nom *</label>
                  <input type="text" value={formLast} onChange={e => setFormLast(e.target.value)} required placeholder="Bensalem" style={inputStyle} />
                </div>
              </div>

              {/* Birth + Gender */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#374151', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date de naissance *</label>
                  <input type="date" value={formBirth} onChange={e => setFormBirth(e.target.value)} required style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#374151', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Genre *</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {(['MALE', 'FEMALE'] as const).map(g => (
                      <button key={g} type="button" onClick={() => setFormGender(g)} style={{ flex: 1, padding: '11px', borderRadius: '10px', border: `1.5px solid ${formGender === g ? (g === 'MALE' ? '#2563eb' : '#be185d') : '#e2e8f0'}`, cursor: 'pointer', fontSize: '13px', fontWeight: '700', background: formGender === g ? (g === 'MALE' ? '#dbeafe' : '#fce7f3') : 'white', color: formGender === g ? (g === 'MALE' ? '#2563eb' : '#be185d') : '#94a3b8', transition: 'all 0.15s' }}>
                        {g === 'MALE' ? '👦 Garçon' : '👧 Fille'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Classroom */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#374151', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Classe</label>
                <select value={formClassroomId} onChange={e => setFormClassroomId(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="">— Non assigné —</option>
                  {classrooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              {/* Parents selection */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#374151', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Lier aux parents ({formParentIds.length} sélectionné{formParentIds.length !== 1 ? 's' : ''})
                </label>
                {parents.length === 0 ? (
                  <div style={{ padding: '12px', background: '#fef3c7', borderRadius: '10px', fontSize: '13px', color: '#92400e' }}>
                    ⚠️ Aucun parent disponible. Créez d'abord des comptes parents dans la page Utilisateurs.
                  </div>
                ) : (
                  <div style={{ maxHeight: '160px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', padding: '2px' }}>
                    {parents.map(p => (
                      <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', background: formParentIds.includes(p.id) ? 'rgba(67,97,238,0.07)' : '#f8fafc', border: `1.5px solid ${formParentIds.includes(p.id) ? 'rgba(67,97,238,0.25)' : '#e2e8f0'}`, cursor: 'pointer', transition: 'all 0.15s' }}>
                        <input type="checkbox" checked={formParentIds.includes(p.id)} onChange={() => toggleParent(p.id)} style={{ width: '16px', height: '16px', accentColor: '#4361EE', cursor: 'pointer', flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                          <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>{p.firstName} {p.lastName}</p>
                          <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8' }}>{p.email}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Medical */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#374151', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Allergies</label>
                <input type="text" value={formAllergies} onChange={e => setFormAllergies(e.target.value)} placeholder="Ex: Arachides, Lactose..." style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#374151', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Notes médicales</label>
                <textarea value={formMedical} onChange={e => setFormMedical(e.target.value)} placeholder="Notes importantes..." rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
              </div>

              <div style={{ display: 'flex', gap: '10px', paddingTop: '4px' }}>
                <button type="button" onClick={() => setShowForm(false)} style={{ flex: 1, padding: '12px', border: '1.5px solid #e2e8f0', borderRadius: '12px', background: 'white', fontSize: '14px', fontWeight: '600', cursor: 'pointer', color: '#374151' }}>Annuler</button>
                <button type="submit" disabled={isPending} style={{ flex: 2, padding: '12px', background: isPending ? '#9ca3af' : 'linear-gradient(135deg, #F72585, #4361EE)', border: 'none', borderRadius: '12px', color: 'white', fontSize: '14px', fontWeight: '700', cursor: isPending ? 'not-allowed' : 'pointer', boxShadow: isPending ? 'none' : '0 4px 14px rgba(247,37,133,0.3)' }}>
                  {isPending ? 'Enregistrement...' : (editId ? '✅ Enregistrer' : '✨ Ajouter l\'enfant')}
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
            <h2 style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>Supprimer l'enfant ?</h2>
            <p style={{ margin: '0 0 6px', fontSize: '15px', color: '#374151', fontWeight: '600' }}>{deleteName}</p>
            <p style={{ margin: '0 0 28px', fontSize: '13px', color: '#94a3b8' }}>Cette action est irréversible. Toutes les présences et liens parents seront supprimés.</p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setDeleteId(null)} style={{ flex: 1, padding: '12px', border: '1.5px solid #e2e8f0', borderRadius: '12px', background: 'white', fontSize: '14px', fontWeight: '600', cursor: 'pointer', color: '#374151' }}>Annuler</button>
              <button onClick={handleDelete} disabled={isPending} style={{ flex: 1, padding: '12px', background: isPending ? '#9ca3af' : '#ef4444', border: 'none', borderRadius: '12px', color: 'white', fontSize: '14px', fontWeight: '700', cursor: isPending ? 'not-allowed' : 'pointer' }}>
                {isPending ? '...' : '🗑️ Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Detail Modal ─── */}
      {detailChild && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(4px)' }} onClick={() => setDetailChild(null)}>
          <div style={{ background: 'white', borderRadius: '24px', padding: '36px', width: '100%', maxWidth: '480px', boxShadow: '0 32px 80px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>Fiche enfant</h2>
              <button onClick={() => setDetailChild(null)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '10px', cursor: 'pointer', padding: '8px', display: 'flex' }}><X size={20} color="#374151" /></button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', padding: '16px', background: detailChild.gender === 'MALE' ? '#dbeafe' : '#fce7f3', borderRadius: '14px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: detailChild.gender === 'MALE' ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' : 'linear-gradient(135deg, #ec4899, #be185d)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: '700', color: 'white', flexShrink: 0 }}>
                {detailChild.firstName[0]}{detailChild.lastName[0]}
              </div>
              <div>
                <p style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>{detailChild.firstName} {detailChild.lastName}</p>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>{getAge(detailChild.birthDate)} · {detailChild.gender === 'MALE' ? 'Garçon' : 'Fille'}</p>
              </div>
            </div>

            {[
              { label: 'Date de naissance', value: new Date(detailChild.birthDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) },
              { label: 'Classe', value: detailChild.classroom?.name || 'Non assigné' },
              { label: 'Allergies', value: detailChild.allergies || 'Aucune' },
              { label: 'Notes médicales', value: detailChild.medicalNotes || 'Aucune' },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '13px', color: '#94a3b8' }}>{row.label}</span>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#374151', maxWidth: '60%', textAlign: 'right' }}>{row.value}</span>
              </div>
            ))}

            <div style={{ marginTop: '16px' }}>
              <p style={{ fontSize: '12px', fontWeight: '700', color: '#374151', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Parent(s)</p>
              {detailChild.parents.length === 0
                ? <p style={{ fontSize: '13px', color: '#94a3b8', fontStyle: 'italic' }}>Aucun parent lié</p>
                : detailChild.parents.map(p => (
                  <div key={p.parent.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: '#f8fafc', borderRadius: '10px', marginBottom: '6px' }}>
                    <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg, #F72585, #4361EE)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', color: 'white', flexShrink: 0 }}>
                      {p.parent.firstName[0]}{p.parent.lastName[0]}
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>{p.parent.firstName} {p.parent.lastName}</p>
                      <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8' }}>{p.parent.email}</p>
                    </div>
                  </div>
                ))
              }
            </div>

            <button onClick={() => { setDetailChild(null); openEdit(detailChild) }} style={{ width: '100%', marginTop: '20px', padding: '12px', background: 'linear-gradient(135deg, #F72585, #4361EE)', border: 'none', borderRadius: '12px', color: 'white', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}>
              <Edit2 size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
              Modifier la fiche
            </button>
          </div>
        </div>
      )}

      <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  )
}
