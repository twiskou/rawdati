'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Search, Eye, X } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/LanguageContext'

interface Child {
  id: string
  firstName: string
  lastName: string
  className?: string
  birthDate?: string | null
  allergies?: string | null
  medicalNotes?: string | null
  attendance: { status: string } | null
}

interface TeacherAttendanceClientProps {
  children: Child[]
  classroomId: string | null
  todayStr: string
  classrooms?: { id: string; name: string }[]
}



export default function TeacherAttendanceClient({ children, classroomId, todayStr, classrooms = [] }: TeacherAttendanceClientProps) {
  const router = useRouter()
  const { t, isRTL } = useLanguage()
  const tr = t.teacher.attendance

  const statusConfig = {
    PRESENT: { label: tr.status.present, bg: '#d1fae5', color: '#059669', activeBg: '#10b981', activeColor: 'white' },
    ABSENT: { label: tr.status.absent, bg: '#fee2e2', color: '#dc2626', activeBg: '#ef4444', activeColor: 'white' },
    LATE: { label: tr.status.late, bg: '#fef3c7', color: '#d97706', activeBg: '#f59e0b', activeColor: 'white' },
  }
  const [attendances, setAttendances] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {}
    children.forEach((c) => {
      if (c.attendance) map[c.id] = c.attendance.status
    })
    return map
  })
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<Record<string, boolean>>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedChild, setSelectedChild] = useState<Child | null>(null)

  const filteredChildren = children.filter(c => 
    `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
  )

  function goToDate(offset: number) {
    const [y, m, d] = todayStr.split('-').map(Number)
    const dateObj = new Date(Date.UTC(y, m - 1, d))
    dateObj.setUTCDate(dateObj.getUTCDate() + offset)
    const newDateStr = dateObj.toISOString().split('T')[0]
    
    const params = new URLSearchParams(window.location.search)
    params.set('date', newDateStr)
    router.push(`/teacher/attendance?${params.toString()}`)
  }

  function handleClassChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(window.location.search)
    params.set('class', e.target.value)
    router.push(`/teacher/attendance?${params.toString()}`)
  }

  async function markAttendance(childId: string, status: string) {
    if (!classroomId) return
    setSaving(childId)
    try {
      const res = await fetch('/api/teacher/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ childId, status, date: todayStr }),
      })
      if (res.ok) {
        setAttendances((prev) => ({ ...prev, [childId]: status }))
        setSaved((prev) => ({ ...prev, [childId]: true }))
        setTimeout(() => setSaved((prev) => ({ ...prev, [childId]: false })), 2000)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(null)
    }
  }

  const presentCount = Object.values(attendances).filter((s) => s === 'PRESENT').length
  const absentCount = Object.values(attendances).filter((s) => s === 'ABSENT').length
  const lateCount = Object.values(attendances).filter((s) => s === 'LATE').length
  const unmarked = children.length - Object.keys(attendances).length

  const dateDisplay = new Date(todayStr).toLocaleDateString(isRTL ? 'ar-EG' : 'fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <div>
      {/* Controls row: class selector + date navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>

        {/* Class selector (only if multiple classrooms) */}
        {classrooms.length > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#64748b' }}>{isRTL ? 'القسم :' : 'Classe :'}</span>
            <select
              value={classroomId || ''}
              onChange={handleClassChange}
              style={{
                padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0',
                background: 'white', color: '#0f172a', fontSize: '14px', fontWeight: '600',
                outline: 'none', cursor: 'pointer', fontFamily: 'inherit'
              }}
            >
              <option value="all">{isRTL ? 'الكل' : 'Tous'}</option>
              {classrooms.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Date navigation */}
        <div style={{ display: 'flex', alignItems: 'center', background: 'white', borderRadius: '12px', padding: '6px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', marginLeft: 'auto', gap: '4px' }}>
          <button
            onClick={() => goToDate(-1)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '500', color: '#374151' }}
            onMouseOver={(e) => (e.currentTarget.style.background = '#f1f5f9')}
            onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <ChevronLeft size={16} /> {isRTL ? 'السابق' : 'Précédent'}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', background: '#f8fafc' }}>
            <span style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', textTransform: 'capitalize' }}>
              📅 {dateDisplay}
            </span>
          </div>

          <button
            onClick={() => goToDate(1)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '500', color: '#374151' }}
            onMouseOver={(e) => (e.currentTarget.style.background = '#f1f5f9')}
            onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            {isRTL ? 'التالي' : 'Suivant'} <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        {[
          { label: tr.present, value: presentCount, color: '#10b981', bg: '#d1fae5' },
          { label: tr.absent, value: absentCount, color: '#ef4444', bg: '#fee2e2' },
          { label: tr.late, value: lateCount, color: '#f59e0b', bg: '#fef3c7' },
          { label: isRTL ? 'لم يسجل' : 'Non marqués', value: unmarked, color: '#94a3b8', bg: '#f1f5f9' },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              background: 'white', borderRadius: '14px', padding: '16px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)', textAlign: 'center',
            }}
          >
            <p style={{ margin: '0 0 2px', fontSize: '26px', fontWeight: '800', color: s.color }}>{s.value}</p>
            <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Student list */}
      {!classroomId ? (
        <div
          style={{
            background: 'white', borderRadius: '20px', padding: '60px 40px',
            textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            border: '1px solid #e2e8f0'
          }}
        >
          <p style={{ fontSize: '64px', margin: '0 0 16px' }}>🚫</p>
          <p style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: '0 0 8px' }}>
            {isRTL ? 'لم يتم تعيين أي قسم' : 'Aucune classe assignée'}
          </p>
          <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
            {isRTL ? 'أنت لست مسؤولة عن أي قسم حالياً. يرجى الاتصال بالإدارة.' : 'Vous n\'êtes assigné(e) à aucune classe pour le moment. Veuillez contacter l\'administration.'}
          </p>
        </div>
      ) : children.length === 0 ? (
        <div
          style={{
            background: 'white', borderRadius: '20px', padding: '60px 40px',
            textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          }}
        >
          <p style={{ fontSize: '64px', margin: '0 0 16px' }}>👶</p>
          <p style={{ fontSize: '18px', fontWeight: '600', color: '#374151', margin: 0 }}>{isRTL ? 'لا يوجد تلاميذ في القسم' : 'Aucun élève dans la classe'}</p>
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: '20px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <h2 style={{ margin: 0, fontSize: '17px', fontWeight: '700', color: '#0f172a' }}>
              {isRTL ? 'التلاميذ' : 'Élèves'} ({children.length})
            </h2>
            
            {/* Search Bar */}
            <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', borderRadius: '12px', padding: '8px 14px', border: '1.5px solid #e2e8f0', flex: '1 1 200px', maxWidth: '300px' }}>
              <Search size={16} color="#94a3b8" style={{ marginRight: '8px' }} />
              <input
                type="text"
                placeholder={isRTL ? 'البحث عن تلميذ...' : 'Rechercher un élève...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '14px', color: '#1e293b', width: '100%', fontFamily: 'inherit', textAlign: isRTL ? 'right' : 'left' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filteredChildren.length === 0 ? (
              <p style={{ color: '#94a3b8', fontSize: '14px', textAlign: 'center', margin: '20px 0' }}>{tr.noStudents}</p>
            ) : filteredChildren.map((child) => {
              const currentStatus = attendances[child.id]
              const isSaving = saving === child.id
              const isSaved = saved[child.id]

              return (
                <div
                  key={child.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '16px',
                    padding: '14px 16px', background: '#f8fafc', borderRadius: '14px',
                    flexWrap: 'wrap',
                  }}
                >
                  {/* Avatar */}
                  <div
                    style={{
                      width: '40px', height: '40px', borderRadius: '50%',
                      background: 'linear-gradient(135deg, #F72585, #4361EE)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '14px', fontWeight: '700', color: 'white', flexShrink: 0,
                    }}
                  >
                    {child.firstName[0]}{child.lastName[0]}
                  </div>

                  {/* Name and Info Button */}
                  <div style={{ flex: 1, minWidth: '120px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div>
                      <p style={{ margin: '0 0 2px', fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
                        {child.firstName} {child.lastName}
                      </p>
                      {child.className && (
                        <p style={{ margin: 0, fontSize: '12px', color: '#64748b', fontWeight: '500' }}>
                          {child.className}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => setSelectedChild(child)}
                      style={{
                        background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px',
                        borderRadius: '8px', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}
                      onMouseOver={(e) => { e.currentTarget.style.background = '#e2e8f0'; e.currentTarget.style.color = '#0f172a' }}
                      onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b' }}
                      title="Voir les informations de l'élève"
                    >
                      <Eye size={16} />
                    </button>
                  </div>

                  {/* Status buttons */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {(Object.entries(statusConfig) as [string, typeof statusConfig.PRESENT][]).map(([status, cfg]) => {
                      const isActive = currentStatus === status
                      return (
                        <button
                          key={status}
                          onClick={() => markAttendance(child.id, status)}
                          disabled={isSaving}
                          style={{
                            padding: '7px 14px', borderRadius: '10px', border: 'none',
                            cursor: isSaving ? 'not-allowed' : 'pointer',
                            fontSize: '12px', fontWeight: '600',
                            background: isActive ? cfg.activeBg : cfg.bg,
                            color: isActive ? cfg.activeColor : cfg.color,
                            transition: 'all 0.15s',
                            opacity: isSaving ? 0.6 : 1,
                          }}
                        >
                          {status === 'PRESENT' ? '✓' : status === 'ABSENT' ? '✗' : '~'} {cfg.label}
                        </button>
                      )
                    })}
                  </div>

                  {isSaved && (
                    <span style={{ fontSize: '12px', color: '#10b981', fontWeight: '600' }}>✅ {tr.successSave}</span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
      {/* Child Info Modal */}
      {selectedChild && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
            padding: '20px'
          }}
          onClick={() => setSelectedChild(null)}
        >
          <div
            style={{
              background: 'white', borderRadius: '24px', width: '100%', maxWidth: '480px',
              boxShadow: '0 24px 80px rgba(0,0,0,0.1)', overflow: 'hidden', animation: 'fadeIn 0.2s ease'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ background: 'linear-gradient(135deg, #F72585, #4361EE)', padding: '24px', color: 'white', position: 'relative' }}>
              <button
                onClick={() => setSelectedChild(null)}
                style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'white', color: '#4361EE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: '800', marginBottom: '16px' }}>
                {selectedChild.firstName[0]}{selectedChild.lastName[0]}
              </div>
              <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '800' }}>
                {selectedChild.firstName} {selectedChild.lastName}
              </h2>
              {selectedChild.className && <p style={{ margin: '4px 0 0', opacity: 0.9 }}>{selectedChild.className}</p>}
            </div>
            
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>{isRTL ? 'تاريخ الميلاد' : 'Date de naissance'}</p>
                  <p style={{ margin: 0, fontSize: '15px', color: '#0f172a', fontWeight: '500' }}>
                    {selectedChild.birthDate ? new Date(selectedChild.birthDate).toLocaleDateString(isRTL ? 'ar-EG' : 'fr-FR') : (isRTL ? 'غير متوفر' : 'Non renseignée')}
                  </p>
                </div>
              </div>
              
              <div>
                <p style={{ margin: '0 0 6px', fontSize: '13px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>{isRTL ? 'الحساسية' : 'Allergies'}</p>
                <div style={{ background: selectedChild.allergies ? '#fee2e2' : '#f1f5f9', padding: '12px', borderRadius: '12px', color: selectedChild.allergies ? '#dc2626' : '#64748b', fontSize: '14px', fontWeight: '500' }}>
                  {selectedChild.allergies || (isRTL ? 'لا يوجد حساسية' : 'Aucune allergie signalée')}
                </div>
              </div>
              
              <div>
                <p style={{ margin: '0 0 6px', fontSize: '13px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>{isRTL ? 'ملاحظات طبية' : 'Notes médicales'}</p>
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px', color: '#374151', fontSize: '14px', lineHeight: '1.5' }}>
                  {selectedChild.medicalNotes || (isRTL ? 'لا يوجد ملاحظات طبية' : 'Aucune note particulière')}
                </div>
              </div>
            </div>
            <div style={{ padding: '16px 24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', textAlign: 'right' }}>
              <button
                onClick={() => setSelectedChild(null)}
                style={{ padding: '10px 24px', borderRadius: '12px', background: 'white', border: '1px solid #cbd5e1', cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: '#374151' }}
              >
                {isRTL ? 'إغلاق' : 'Fermer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
