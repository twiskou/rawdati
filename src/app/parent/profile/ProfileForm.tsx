'use client'

import { useState, useTransition } from 'react'
import { UserCircle, Camera, Save, Lock, Eye, EyeOff } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/LanguageContext'

interface ProfileFormProps {
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
    phone: string | null
    avatar: string | null
  }
}

export default function ProfileForm({ user }: ProfileFormProps) {
  const [firstName, setFirstName] = useState(user.firstName)
  const [lastName, setLastName] = useState(user.lastName)
  const [phone, setPhone] = useState(user.phone ?? '')
  const [showOldPwd, setShowOldPwd] = useState(false)
  const [showNewPwd, setShowNewPwd] = useState(false)
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [pwdMsg, setPwdMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [isPendingProfile, startProfile] = useTransition()
  const [isPendingPwd, startPwd] = useTransition()
  const { t } = useLanguage()

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault()
    startProfile(async () => {
      // Simulate API call
      await new Promise((r) => setTimeout(r, 500))
      setProfileMsg({ type: 'success', text: t.parent.profile.successMsg })
      setTimeout(() => setProfileMsg(null), 3000)
    })
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault()
    startPwd(async () => {
      await new Promise((r) => setTimeout(r, 500))
      setPwdMsg({ type: 'success', text: t.parent.profile.successMsg })
      setTimeout(() => setPwdMsg(null), 3000)
    })
  }

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

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '12px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '6px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '700px' }}>
      {/* Profile card */}
      <div style={{ background: 'white', borderRadius: '20px', padding: '32px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        {/* Avatar section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '28px' }}>
          <div style={{ position: 'relative' }}>
            <div
              style={{
                width: '90px',
                height: '90px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #F72585, #4361EE)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                fontWeight: '700',
                color: 'white',
                overflow: 'hidden',
              }}
            >
              {user.avatar ? (
                <img src={user.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <UserCircle size={48} color="white" />
              )}
            </div>
            <button
              style={{
                position: 'absolute',
                bottom: 0,
                insetInlineEnd: 0,
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #F72585, #4361EE)',
                border: '2px solid white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <Camera size={12} color="white" />
            </button>
          </div>
          <div>
            <p style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>
              {user.firstName} {user.lastName}
            </p>
            <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>{user.email}</p>
          </div>
        </div>

        {/* Success/error message */}
        {profileMsg && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '12px',
              marginBottom: '20px',
              background: profileMsg.type === 'success' ? '#d1fae5' : '#fee2e2',
              color: profileMsg.type === 'success' ? '#059669' : '#dc2626',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            {profileMsg.type === 'success' ? '✅' : '❌'} {profileMsg.text}
          </div>
        )}

        <form onSubmit={handleProfileSave} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>{t.parent.profile.firstName}</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>{t.parent.profile.lastName}</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>{t.parent.profile.email}</label>
            <input
              type="email"
              value={user.email}
              disabled
              style={{ ...inputStyle, opacity: 0.6, cursor: 'not-allowed' }}
            />
            <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#94a3b8' }}>
              L&apos;email ne peut pas être modifié
            </p>
          </div>

          <div>
            <label style={labelStyle}>{t.parent.profile.phone}</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+213 XXX XXX XXX"
              style={inputStyle}
            />
          </div>

          <button
            type="submit"
            disabled={isPendingProfile}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '13px 24px',
              background: isPendingProfile ? '#9ca3af' : 'linear-gradient(135deg, #F72585, #4361EE)',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              fontSize: '14px',
              fontWeight: '600',
              cursor: isPendingProfile ? 'not-allowed' : 'pointer',
              alignSelf: 'flex-start',
              boxShadow: '0 4px 15px rgba(247,37,133,0.25)',
            }}
          >
            <Save size={16} />
            {isPendingProfile ? t.parent.profile.saving : t.parent.profile.save}
          </button>
        </form>
      </div>

      {/* Password section */}
      <div style={{ background: 'white', borderRadius: '20px', padding: '32px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'rgba(67,97,238,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Lock size={18} color="#4361EE" />
          </div>
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
            {t.parent.profile.password}
          </h2>
        </div>

        {pwdMsg && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '12px',
              marginBottom: '20px',
              background: pwdMsg.type === 'success' ? '#d1fae5' : '#fee2e2',
              color: pwdMsg.type === 'success' ? '#059669' : '#dc2626',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            {pwdMsg.type === 'success' ? '✅' : '❌'} {pwdMsg.text}
          </div>
        )}

        <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={labelStyle}>{t.parent.profile.password}</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showOldPwd ? 'text' : 'password'}
                placeholder="••••••••"
                required
                style={{ ...inputStyle, paddingRight: '44px' }}
              />
              <button
                type="button"
                onClick={() => setShowOldPwd(!showOldPwd)}
                style={{
                  position: 'absolute',
                  insetInlineEnd: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#94a3b8',
                }}
              >
                {showOldPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label style={labelStyle}>{t.parent.profile.password}</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showNewPwd ? 'text' : 'password'}
                placeholder="••••••••"
                required
                minLength={6}
                style={{ ...inputStyle, paddingRight: '44px' }}
              />
              <button
                type="button"
                onClick={() => setShowNewPwd(!showNewPwd)}
                style={{
                  position: 'absolute',
                  insetInlineEnd: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#94a3b8',
                }}
              >
                {showNewPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isPendingPwd}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '13px 24px',
              background: isPendingPwd ? '#9ca3af' : '#4361EE',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              fontSize: '14px',
              fontWeight: '600',
              cursor: isPendingPwd ? 'not-allowed' : 'pointer',
              alignSelf: 'flex-start',
            }}
          >
            <Lock size={16} />
            {isPendingPwd ? t.parent.profile.saving : t.parent.profile.save}
          </button>
        </form>
      </div>
    </div>
  )
}
