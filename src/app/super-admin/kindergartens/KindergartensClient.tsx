'use client'

import { useState, useTransition } from 'react'
import { Plus, X, Edit2, CheckCircle, XCircle, UserPlus } from 'lucide-react'
import { useT } from '@/lib/i18n/LanguageContext'

interface Kindergarten {
  id: string
  name: string
  address: string | null
  phone: string | null
  email: string | null
  isActive: boolean
  createdAt: string
  usersCount: number
  childrenCount: number
  classroomsCount: number
}

interface KindergartensClientProps {
  kindergartens: Kindergarten[]
}

export default function KindergartensClient({ kindergartens: initial }: KindergartensClientProps) {
  const t = useT()
  const [kgs, setKgs] = useState<Kindergarten[]>(initial)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  // Admin account modal
  const [showAdminModal, setShowAdminModal] = useState(false)
  const [adminKgId, setAdminKgId] = useState<string | null>(null)
  const [adminKgName, setAdminKgName] = useState('')
  const [adminFirstName, setAdminFirstName] = useState('')
  const [adminLastName, setAdminLastName] = useState('')
  const [adminEmail, setAdminEmail] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [adminPending, startAdminTransition] = useTransition()

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const url = '/api/super-admin/kindergartens'
      const method = editId ? 'PUT' : 'POST'
      const body = editId
        ? JSON.stringify({ id: editId, name, address, phone, email })
        : JSON.stringify({ name, address, phone, email })

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body,
      })
      if (res.ok) {
        showMsg(true, editId ? t.superAdmin.kindergartens.successEdit : t.superAdmin.kindergartens.successCreate)
        setShowForm(false)
        setName(''); setAddress(''); setPhone(''); setEmail('')
        setEditId(null)
        setTimeout(() => window.location.reload(), 800)
      } else {
        showMsg(false, editId ? t.superAdmin.kindergartens.errorEdit : t.superAdmin.kindergartens.errorCreate)
      }
    })
  }

  async function handleToggleActive(kg: Kindergarten) {
    const newState = !kg.isActive
    // Optimistic update
    setKgs(prev => prev.map(k => k.id === kg.id ? { ...k, isActive: newState } : k))
    const res = await fetch('/api/super-admin/kindergartens', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: kg.id, isActive: newState }),
    })
    if (!res.ok) {
      // Revert
      setKgs(prev => prev.map(k => k.id === kg.id ? { ...k, isActive: kg.isActive } : k))
      showMsg(false, t.superAdmin.kindergartens.errorStatus)
    } else {
      showMsg(true, newState ? `${t.superAdmin.kindergartens.active} ✅` : `${t.superAdmin.kindergartens.inactive} ⛔`)
    }
  }

  async function handleCreateAdmin(e: React.FormEvent) {
    e.preventDefault()
    startAdminTransition(async () => {
      const res = await fetch('/api/super-admin/kindergartens/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kindergartenId: adminKgId,
          firstName: adminFirstName,
          lastName: adminLastName,
          email: adminEmail,
          password: adminPassword,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        showMsg(true, `Compte admin créé pour ${adminKgName} — Email: ${adminEmail}`)
        setShowAdminModal(false)
        setAdminFirstName(''); setAdminLastName(''); setAdminEmail(''); setAdminPassword('')
      } else {
        showMsg(false, data.error || 'Erreur lors de la création du compte admin')
      }
    })
  }

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
        <button
          onClick={() => {
            setEditId(null)
            setName(''); setAddress(''); setPhone(''); setEmail('')
            setShowForm(true)
          }}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px',
            background: 'linear-gradient(135deg, #F72585, #4361EE)',
            border: 'none', borderRadius: '12px', color: 'white',
            fontSize: '14px', fontWeight: '600', cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(247,37,133,0.3)',
          }}
        >
          <Plus size={16} />
          {t.superAdmin.kindergartens.addBtn}
        </button>
      </div>

      {msg && (
        <div style={{ padding: '12px 16px', borderRadius: '12px', marginBottom: '20px', background: msg.ok ? '#d1fae5' : '#fee2e2', color: msg.ok ? '#059669' : '#dc2626', fontSize: '14px', fontWeight: '500' }}>
          {msg.ok ? '✅' : '❌'} {msg.text}
        </div>
      )}

      {/* Crèche Form Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setShowForm(false)}>
          <div style={{ background: 'white', borderRadius: '24px', padding: '40px', width: '100%', maxWidth: '520px', boxShadow: '0 32px 80px rgba(0,0,0,0.2)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
              <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '800', color: '#0f172a' }}>{editId ? t.superAdmin.kindergartens.editNursery : t.superAdmin.kindergartens.newNursery}</h2>
              <button onClick={() => setShowForm(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer', padding: '8px', display: 'flex' }}>
                <X size={20} color="#374151" />
              </button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {[
                { label: t.superAdmin.kindergartens.fieldName, value: name, setter: setName, type: 'text', placeholder: t.superAdmin.kindergartens.placeholderName, required: true },
                { label: t.superAdmin.kindergartens.fieldAddress, value: address, setter: setAddress, type: 'text', placeholder: t.superAdmin.kindergartens.placeholderAddress, required: false },
                { label: t.superAdmin.kindergartens.fieldPhone, value: phone, setter: setPhone, type: 'tel', placeholder: t.superAdmin.kindergartens.placeholderPhone, required: false },
                { label: t.superAdmin.kindergartens.fieldEmail, value: email, setter: setEmail, type: 'email', placeholder: t.superAdmin.kindergartens.placeholderEmail, required: false },
              ].map((f) => (
                <div key={f.label}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {f.label}
                  </label>
                  <input type={f.type} value={f.value} onChange={(e) => f.setter(e.target.value)} required={f.required} placeholder={f.placeholder} style={inputStyle} />
                </div>
              ))}
              <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
                <button type="button" onClick={() => setShowForm(false)} style={{ flex: 1, padding: '14px', border: '1.5px solid #e2e8f0', borderRadius: '12px', background: 'white', fontSize: '14px', fontWeight: '600', cursor: 'pointer', color: '#374151' }}>
                  {t.superAdmin.kindergartens.cancel}
                </button>
                <button type="submit" disabled={isPending} style={{ flex: 1, padding: '14px', background: isPending ? '#9ca3af' : 'linear-gradient(135deg, #F72585, #4361EE)', border: 'none', borderRadius: '12px', color: 'white', fontSize: '14px', fontWeight: '600', cursor: isPending ? 'not-allowed' : 'pointer' }}>
                  {isPending ? t.superAdmin.kindergartens.saving : (editId ? t.superAdmin.kindergartens.save : t.superAdmin.kindergartens.create)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Admin Modal */}
      {showAdminModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setShowAdminModal(false)}>
          <div style={{ background: 'white', borderRadius: '24px', padding: '40px', width: '100%', maxWidth: '520px', boxShadow: '0 32px 80px rgba(0,0,0,0.2)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>{t.superAdmin.kindergartens.createAdmin}</h2>
              <button onClick={() => setShowAdminModal(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer', padding: '8px', display: 'flex' }}>
                <X size={20} color="#374151" />
              </button>
            </div>
            <p style={{ margin: '0 0 24px', fontSize: '13px', color: '#64748b' }}>
              {t.superAdmin.kindergartens.nurseryLabel} <strong style={{ color: '#4361EE' }}>{adminKgName}</strong>
            </p>
            <form onSubmit={handleCreateAdmin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#374151', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t.superAdmin.kindergartens.fieldFirstName}</label>
                  <input type="text" value={adminFirstName} onChange={e => setAdminFirstName(e.target.value)} required placeholder={t.superAdmin.kindergartens.placeholderFirstName} style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#374151', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t.superAdmin.kindergartens.fieldLastName}</label>
                  <input type="text" value={adminLastName} onChange={e => setAdminLastName(e.target.value)} required placeholder={t.superAdmin.kindergartens.placeholderLastName} style={inputStyle} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#374151', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t.superAdmin.kindergartens.fieldAdminEmail}</label>
                <input type="email" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} required placeholder={t.superAdmin.kindergartens.placeholderAdminEmail} style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#374151', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t.superAdmin.kindergartens.fieldPassword}</label>
                <input type="password" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} required placeholder={t.superAdmin.kindergartens.placeholderPassword} minLength={6} style={inputStyle} />
              </div>
              <div style={{ background: 'linear-gradient(135deg, rgba(67,97,238,0.06), rgba(247,37,133,0.04))', border: '1px solid rgba(67,97,238,0.12)', borderRadius: '10px', padding: '12px 14px' }}>
                <p style={{ margin: 0, fontSize: '12px', color: '#4361EE', fontWeight: '500' }}>
                  {t.superAdmin.kindergartens.adminNote}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '12px', paddingTop: '4px' }}>
                <button type="button" onClick={() => setShowAdminModal(false)} style={{ flex: 1, padding: '13px', border: '1.5px solid #e2e8f0', borderRadius: '12px', background: 'white', fontSize: '14px', fontWeight: '600', cursor: 'pointer', color: '#374151' }}>
                  {t.superAdmin.kindergartens.cancel}
                </button>
                <button type="submit" disabled={adminPending} style={{ flex: 2, padding: '13px', background: adminPending ? '#9ca3af' : 'linear-gradient(135deg, #4361EE, #7209b7)', border: 'none', borderRadius: '12px', color: 'white', fontSize: '14px', fontWeight: '600', cursor: adminPending ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <UserPlus size={15} />
                  {adminPending ? t.superAdmin.kindergartens.creating : t.superAdmin.kindergartens.createAccountBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      {kgs.length === 0 ? (
        <div style={{ background: 'white', borderRadius: '20px', padding: '60px', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <p style={{ fontSize: '64px', margin: '0 0 16px' }}>🏫</p>
          <p style={{ fontSize: '18px', fontWeight: '600', color: '#374151', margin: '0 0 8px' }}>{t.superAdmin.kindergartens.noNurseries}</p>
          <p style={{ color: '#64748b', margin: 0 }}>{t.superAdmin.kindergartens.noNurseriesDesc}</p>
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                {[t.superAdmin.kindergartens.colName, t.superAdmin.kindergartens.colContact, t.superAdmin.kindergartens.colUsers, t.superAdmin.kindergartens.colChildren, t.superAdmin.kindergartens.colClasses, t.superAdmin.kindergartens.colStatus, t.superAdmin.kindergartens.colActions].map((h) => (
                  <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {kgs.map((kg, i) => (
                <tr
                  key={kg.id}
                  style={{ borderBottom: i < kgs.length - 1 ? '1px solid #f8fafc' : 'none', transition: 'background 0.15s' }}
                  onMouseOver={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = '#fafbff')}
                  onMouseOut={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = 'white')}
                >
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, rgba(247,37,133,0.1), rgba(67,97,238,0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
                        🏫
                      </div>
                      <div>
                        <p style={{ margin: '0 0 2px', fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>{kg.name}</p>
                        <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8' }}>{kg.address ?? '—'}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div>
                      <p style={{ margin: '0 0 2px', fontSize: '12px', color: '#64748b' }}>{kg.email ?? '—'}</p>
                      <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>{kg.phone ?? '—'}</p>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ fontSize: '16px', fontWeight: '700', color: '#4361EE' }}>{kg.usersCount}</span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ fontSize: '16px', fontWeight: '700', color: '#F72585' }}>{kg.childrenCount}</span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ fontSize: '16px', fontWeight: '700', color: '#10b981' }}>{kg.classroomsCount}</span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: '600', color: kg.isActive ? '#10b981' : '#ef4444' }}>
                      {kg.isActive ? <CheckCircle size={14} /> : <XCircle size={14} />}
                      {kg.isActive ? t.superAdmin.kindergartens.active : t.superAdmin.kindergartens.inactive}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {/* Edit */}
                      <button
                        onClick={() => {
                          setEditId(kg.id)
                          setName(kg.name)
                          setAddress(kg.address || '')
                          setPhone(kg.phone || '')
                          setEmail(kg.email || '')
                          setShowForm(true)
                        }}
                        style={{ padding: '6px 10px', borderRadius: '8px', background: '#f1f5f9', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '500', color: '#374151' }}
                      >
                        <Edit2 size={13} /> {t.superAdmin.kindergartens.edit}
                      </button>

                      {/* Toggle Active */}
                      <button
                        onClick={() => handleToggleActive(kg)}
                        style={{ padding: '6px 10px', borderRadius: '8px', background: kg.isActive ? '#fee2e2' : '#d1fae5', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: '500', color: kg.isActive ? '#ef4444' : '#059669' }}
                      >
                        {kg.isActive ? t.superAdmin.kindergartens.deactivate : t.superAdmin.kindergartens.activate}
                      </button>

                      {/* Create Admin Account */}
                      <button
                        onClick={() => {
                          setAdminKgId(kg.id)
                          setAdminKgName(kg.name)
                          setAdminFirstName(''); setAdminLastName('')
                          setAdminEmail(''); setAdminPassword('')
                          setShowAdminModal(true)
                        }}
                        title={t.superAdmin.kindergartens.createAdmin}
                        style={{ padding: '6px 10px', borderRadius: '8px', background: 'linear-gradient(135deg, rgba(67,97,238,0.1), rgba(114,9,183,0.1))', border: '1px solid rgba(67,97,238,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '600', color: '#4361EE' }}
                      >
                        <UserPlus size={13} /> {t.superAdmin.kindergartens.adminAccount}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
