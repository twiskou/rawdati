'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Edit2, CheckCircle, AlertTriangle, X } from 'lucide-react'

interface TeacherMealsClientProps {
  kindergartenId: string | null
  existingMeal: { breakfast: string | null; lunch: string | null; snack: string | null } | null
  todayStr: string
}

export default function TeacherMealsClient({ kindergartenId, existingMeal: initialMeal, todayStr }: TeacherMealsClientProps) {
  const router = useRouter()
  const [existingMeal, setExistingMeal] = useState(initialMeal)
  const [isEditing, setIsEditing] = useState(!initialMeal)
  
  const [breakfast, setBreakfast] = useState(initialMeal?.breakfast ?? '')
  const [lunch, setLunch] = useState(initialMeal?.lunch ?? '')
  const [snack, setSnack] = useState(initialMeal?.snack ?? '')
  
  const [showConfirm, setShowConfirm] = useState(false)
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '14px',
    border: '1.5px solid #e2e8f0',
    borderRadius: '12px',
    fontSize: '14px',
    color: '#1e293b',
    background: '#f8fafc',
    outline: 'none',
    resize: 'vertical' as const,
    minHeight: '80px',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  }

  function handleSaveClick(e: React.FormEvent) {
    e.preventDefault()
    if (!kindergartenId) return
    setShowConfirm(true)
  }

  async function handleConfirmSubmit() {
    setShowConfirm(false)
    if (!kindergartenId) return
    
    startTransition(async () => {
      const res = await fetch('/api/teacher/meals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kindergartenId, breakfast, lunch, snack, date: todayStr }),
      })
      if (res.ok) {
        setMsg({ type: 'success', text: 'Repas publié avec succès !' })
        setExistingMeal({ breakfast, lunch, snack })
        setIsEditing(false)
        router.refresh()
      } else {
        setMsg({ type: 'error', text: 'Erreur lors de la publication' })
      }
      setTimeout(() => setMsg(null), 3000)
    })
  }

  const meals = [
    { key: 'breakfast', label: 'Petit-déjeuner', emoji: '🥐', value: breakfast, setter: setBreakfast },
    { key: 'lunch', label: 'Déjeuner', emoji: '🍽️', value: lunch, setter: setLunch },
    { key: 'snack', label: 'Goûter', emoji: '🍎', value: snack, setter: setSnack },
  ]

  return (
    <div>
      {/* Today card */}
      <div
        style={{
          background: 'linear-gradient(135deg, #F72585 0%, #4361EE 100%)',
          borderRadius: '20px', padding: '24px 28px', marginBottom: '28px',
          color: 'white', boxShadow: '0 8px 32px rgba(247,37,133,0.25)',
        }}
      >
        <p style={{ margin: '0 0 4px', fontSize: '13px', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Menu du
        </p>
        <p style={{ margin: 0, fontSize: '22px', fontWeight: '700' }}>
          {new Date(todayStr).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
        {existingMeal && !isEditing && (
          <span
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '12px',
              padding: '6px 12px', borderRadius: '999px',
              background: 'rgba(255,255,255,0.2)', fontSize: '13px', fontWeight: '600',
            }}
          >
            <CheckCircle size={16} /> Menu publié
          </span>
        )}
      </div>

      {msg && (
        <div
          style={{
            padding: '14px 18px', borderRadius: '12px', marginBottom: '20px',
            background: msg.type === 'success' ? '#d1fae5' : '#fee2e2',
            color: msg.type === 'success' ? '#059669' : '#dc2626',
            fontSize: '14px', fontWeight: '600',
            display: 'flex', alignItems: 'center', gap: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
          }}
        >
          {msg.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />} 
          {msg.text}
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirm && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
            backdropFilter: 'blur(4px)'
          }}
          onClick={() => setShowConfirm(false)}
        >
          <div
            style={{
              background: 'white', borderRadius: '24px', padding: '36px',
              width: '100%', maxWidth: '420px', boxShadow: '0 24px 80px rgba(0,0,0,0.2)', textAlign: 'center'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Save size={28} color="#4361EE" />
            </div>
            <h2 style={{ margin: '0 0 12px', fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>
              Confirmer la publication
            </h2>
            <p style={{ margin: '0 0 28px', fontSize: '15px', color: '#64748b', lineHeight: '1.5' }}>
              Êtes-vous sûr de vouloir publier ce menu pour aujourd'hui ? Tous les parents pourront le consulter.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => setShowConfirm(false)} 
                style={{ flex: 1, padding: '13px', border: '1.5px solid #e2e8f0', borderRadius: '12px', background: 'white', fontSize: '14px', fontWeight: '600', cursor: 'pointer', color: '#374151' }}
              >
                Annuler
              </button>
              <button 
                onClick={handleConfirmSubmit} 
                style={{ flex: 1, padding: '13px', background: 'linear-gradient(135deg, #F72585, #4361EE)', border: 'none', borderRadius: '12px', color: 'white', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}
              >
                Oui, publier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {!kindergartenId ? (
        <div style={{ background: 'white', borderRadius: '20px', padding: '40px', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <p style={{ fontSize: '14px', color: '#64748b' }}>Aucune crèche associée.</p>
        </div>
      ) : !isEditing && existingMeal ? (
        // VIEW MODE
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Menu du jour</h2>
            <button
              onClick={() => setIsEditing(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 16px', borderRadius: '10px',
                background: '#f1f5f9', border: 'none', cursor: 'pointer',
                fontSize: '13px', fontWeight: '600', color: '#374151',
                transition: 'background 0.15s'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#e2e8f0'}
              onMouseOut={(e) => e.currentTarget.style.background = '#f1f5f9'}
            >
              <Edit2 size={14} /> Modifier
            </button>
          </div>
          
          <div style={{ background: 'white', borderRadius: '20px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {meals.map((m) => (
                <div key={m.key} style={{ display: 'flex', gap: '16px', borderBottom: m.key === 'snack' ? 'none' : '1px solid #f1f5f9', paddingBottom: m.key === 'snack' ? '0' : '20px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0 }}>
                    {m.emoji}
                  </div>
                  <div>
                    <h3 style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>{m.label}</h3>
                    <p style={{ margin: 0, fontSize: '14px', color: m.value ? '#374151' : '#94a3b8', lineHeight: '1.5' }}>
                      {m.value || 'Non renseigné'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        // EDIT MODE
        <form onSubmit={handleSaveClick}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
              {existingMeal ? 'Modifier le menu' : 'Remplir le menu'}
            </h2>
            {existingMeal && (
              <button
                type="button"
                onClick={() => {
                  setBreakfast(existingMeal.breakfast ?? '')
                  setLunch(existingMeal.lunch ?? '')
                  setSnack(existingMeal.snack ?? '')
                  setIsEditing(false)
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px',
                  borderRadius: '10px', background: 'transparent', border: '1px solid #e2e8f0',
                  cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#64748b'
                }}
              >
                <X size={14} /> Annuler
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '24px' }}>
            {meals.map((m) => (
              <div
                key={m.key}
                style={{
                  background: 'white', borderRadius: '20px', padding: '24px',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                  <span style={{ fontSize: '28px' }}>{m.emoji}</span>
                  <div>
                    <label style={{ display: 'block', fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>
                      {m.label}
                    </label>
                    <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>
                      Décrivez le plat proposé
                    </p>
                  </div>
                </div>
                <textarea
                  value={m.value}
                  onChange={(e) => m.setter(e.target.value)}
                  placeholder={`Ex: ${m.key === 'breakfast' ? 'Lait chaud, pain beurre, jus d\'orange' : m.key === 'lunch' ? 'Soupe de légumes, poulet rôti, salade' : 'Yaourt, fruits frais'}`}
                  style={inputStyle}
                />
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={isPending}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px', width: '100%', justifyContent: 'center',
              padding: '16px 28px',
              background: isPending ? '#9ca3af' : 'linear-gradient(135deg, #F72585, #4361EE)',
              border: 'none', borderRadius: '14px', color: 'white',
              fontSize: '15px', fontWeight: '700', cursor: isPending ? 'not-allowed' : 'pointer',
              boxShadow: isPending ? 'none' : '0 4px 15px rgba(247,37,133,0.3)',
            }}
          >
            <Save size={18} />
            {isPending ? 'En cours...' : existingMeal ? 'Mettre à jour le menu' : 'Publier le menu'}
          </button>
        </form>
      )}
    </div>
  )
}
