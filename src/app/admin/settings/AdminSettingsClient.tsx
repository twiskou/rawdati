'use client'

import { useState, useTransition, useRef } from 'react'
import { Save, Building2, Phone, Mail, MapPin, MessageCircle, Upload, Lock, Key, CheckCircle, AlertTriangle } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/LanguageContext'

interface KindergartenData {
  id: string
  name: string
  address: string | null
  phone: string | null
  whatsappNumber: string | null
  email: string | null
  logo: string | null
}

interface AdminSettingsClientProps {
  kindergarten: KindergartenData
}

export default function AdminSettingsClient({ kindergarten }: AdminSettingsClientProps) {
  const { t, isRTL } = useLanguage()
  const tr = t.admin.settings

  // General Info State
  const [name, setName] = useState(kindergarten.name)
  const [address, setAddress] = useState(kindergarten.address ?? '')
  const [phone, setPhone] = useState(kindergarten.phone ?? '')
  const [whatsapp, setWhatsapp] = useState(kindergarten.whatsappNumber ?? '')
  const [email, setEmail] = useState(kindergarten.email ?? '')
  const [logo, setLogo] = useState(kindergarten.logo ?? '')
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  // Password State
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwdMsg, setPwdMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [isPwdPending, startPwdTransition] = useTransition()

  const fileInputRef = useRef<HTMLInputElement>(null)

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: isRTL ? '13px 44px 13px 14px' : '13px 14px 13px 44px',
    border: '1.5px solid #e2e8f0', borderRadius: '12px',
    fontSize: '14px', color: '#1e293b', background: '#f8fafc',
    outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
    textAlign: isRTL ? 'right' : 'left',
  }

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Check size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      setMsg({ ok: false, text: tr.logoError })
      setTimeout(() => setMsg(null), 3000)
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      if (event.target?.result) {
        setLogo(event.target.result as string)
      }
    }
    reader.readAsDataURL(file)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: kindergarten.id, name, address, phone, whatsappNumber: whatsapp, email, logo }),
      })
      if (res.ok) {
        setMsg({ ok: true, text: tr.successInfo })
      } else {
        setMsg({ ok: false, text: tr.errorInfo })
      }
      setTimeout(() => setMsg(null), 3000)
    })
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (newPassword !== confirmPassword) {
      setPwdMsg({ ok: false, text: tr.pwdMismatch })
      setTimeout(() => setPwdMsg(null), 3000)
      return
    }

    if (newPassword.length < 6) {
      setPwdMsg({ ok: false, text: tr.pwdShort })
      setTimeout(() => setPwdMsg(null), 3000)
      return
    }

    startPwdTransition(async () => {
      const res = await fetch('/api/admin/settings/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      
      if (res.ok) {
        setPwdMsg({ ok: true, text: tr.successPwd })
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        let errText = tr.errorPwd
        try {
          const err = await res.json()
          if (err && err.error) errText = err.error
        } catch (e) {
          // Ignore JSON parse error
        }
        setPwdMsg({ ok: false, text: errText })
      }
      setTimeout(() => setPwdMsg(null), 4000)
    })
  }

  const fields = [
    { label: tr.name, icon: <Building2 size={16} color="#94a3b8" />, value: name, setter: setName, type: 'text', placeholder: tr.namePlh },
    { label: tr.address, icon: <MapPin size={16} color="#94a3b8" />, value: address, setter: setAddress, type: 'text', placeholder: tr.addressPlh },
    { label: tr.phone, icon: <Phone size={16} color="#94a3b8" />, value: phone, setter: setPhone, type: 'tel', placeholder: tr.phonePlh },
    { label: tr.email, icon: <Mail size={16} color="#94a3b8" />, value: email, setter: setEmail, type: 'email', placeholder: tr.emailPlh },
    { label: tr.whatsapp, icon: <MessageCircle size={16} color="#94a3b8" />, value: whatsapp, setter: setWhatsapp, type: 'tel', placeholder: tr.whatsappPlh },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '720px', direction: isRTL ? 'rtl' : 'ltr' }}>
      {/* Logo card */}
      <div style={{ background: 'white', borderRadius: '20px', padding: '28px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <h2 style={{ margin: '0 0 20px', fontSize: '17px', fontWeight: '700', color: '#0f172a' }}>{tr.logoTitle}</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
          <div
            style={{
              width: '96px', height: '96px', borderRadius: '20px',
              background: 'linear-gradient(135deg, rgba(247,37,133,0.08), rgba(67,97,238,0.08))',
              border: '2px dashed rgba(67,97,238,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              overflow: 'hidden',
            }}
          >
            {logo ? (
              <img src={logo} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: '40px' }}>🏫</span>
            )}
          </div>
          <div>
            <p style={{ margin: '0 0 12px', fontSize: '14px', color: '#64748b', lineHeight: '1.5', whiteSpace: 'pre-line' }}>
              {tr.logoDesc}
            </p>
            <input 
              type="file" 
              accept="image/png, image/jpeg, image/svg+xml" 
              style={{ display: 'none' }} 
              ref={fileInputRef}
              onChange={handleLogoChange}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px',
                background: 'linear-gradient(135deg, #F72585, #4361EE)',
                border: 'none', borderRadius: '10px', color: 'white',
                fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(247,37,133,0.25)',
              }}
            >
              <Upload size={15} />
              {tr.chooseLogo}
            </button>
          </div>
        </div>
      </div>

      {/* Info form */}
      <div style={{ background: 'white', borderRadius: '20px', padding: '28px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <h2 style={{ margin: '0 0 24px', fontSize: '17px', fontWeight: '700', color: '#0f172a' }}>
          {tr.infoTitle}
        </h2>

        {msg && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderRadius: '12px', marginBottom: '20px', background: msg.ok ? '#d1fae5' : '#fee2e2', color: msg.ok ? '#059669' : '#dc2626', fontSize: '14px', fontWeight: '600' }}>
            {msg.ok ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
            {msg.text}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {fields.map((f) => (
            <div key={f.label}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {f.label}
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', [isRTL ? 'right' : 'left']: '14px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center' }}>
                  {f.icon}
                </div>
                <input
                  type={f.type}
                  value={f.value}
                  onChange={(e) => f.setter(e.target.value)}
                  placeholder={f.placeholder}
                  style={inputStyle}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#4361EE'
                    e.target.style.boxShadow = '0 0 0 3px rgba(67,97,238,0.1)'
                    e.target.style.background = 'white'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e2e8f0'
                    e.target.style.boxShadow = 'none'
                    e.target.style.background = '#f8fafc'
                  }}
                />
              </div>
              {f.label === tr.whatsapp && (
                <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#94a3b8' }}>
                  {tr.whatsappHint}
                </p>
              )}
            </div>
          ))}

          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '8px' }}>
            <button
              type="submit"
              disabled={isPending}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '14px 28px',
                background: isPending ? '#9ca3af' : 'linear-gradient(135deg, #F72585, #4361EE)',
                border: 'none', borderRadius: '14px', color: 'white',
                fontSize: '15px', fontWeight: '600', cursor: isPending ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 15px rgba(247,37,133,0.3)',
                transition: 'opacity 0.2s',
              }}
            >
              <Save size={18} />
              {isPending ? tr.savingInfo : tr.saveInfo}
            </button>
          </div>
        </form>
      </div>

      {/* Password Change */}
      <div style={{ background: 'white', borderRadius: '20px', padding: '28px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <h2 style={{ margin: '0 0 24px', fontSize: '17px', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Lock size={18} color="#0f172a" />
          {tr.pwdTitle}
        </h2>

        {pwdMsg && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderRadius: '12px', marginBottom: '20px', background: pwdMsg.ok ? '#d1fae5' : '#fee2e2', color: pwdMsg.ok ? '#059669' : '#dc2626', fontSize: '14px', fontWeight: '600' }}>
            {pwdMsg.ok ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
            {pwdMsg.text}
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {tr.oldPwd}
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', [isRTL ? 'right' : 'left']: '14px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center' }}>
                <Key size={16} color="#94a3b8" />
              </div>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder={tr.pwdPlh}
                style={inputStyle}
                onFocus={(e) => {
                  e.target.style.borderColor = '#4361EE'
                  e.target.style.boxShadow = '0 0 0 3px rgba(67,97,238,0.1)'
                  e.target.style.background = 'white'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e2e8f0'
                  e.target.style.boxShadow = 'none'
                  e.target.style.background = '#f8fafc'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {tr.newPwd}
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', [isRTL ? 'right' : 'left']: '14px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center' }}>
                <Lock size={16} color="#94a3b8" />
              </div>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={tr.pwdPlh}
                style={inputStyle}
                onFocus={(e) => {
                  e.target.style.borderColor = '#4361EE'
                  e.target.style.boxShadow = '0 0 0 3px rgba(67,97,238,0.1)'
                  e.target.style.background = 'white'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e2e8f0'
                  e.target.style.boxShadow = 'none'
                  e.target.style.background = '#f8fafc'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {tr.confirmPwd}
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', [isRTL ? 'right' : 'left']: '14px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center' }}>
                <Lock size={16} color="#94a3b8" />
              </div>
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={tr.pwdPlh}
                style={inputStyle}
                onFocus={(e) => {
                  e.target.style.borderColor = '#4361EE'
                  e.target.style.boxShadow = '0 0 0 3px rgba(67,97,238,0.1)'
                  e.target.style.background = 'white'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e2e8f0'
                  e.target.style.boxShadow = 'none'
                  e.target.style.background = '#f8fafc'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '8px' }}>
            <button
              type="submit"
              disabled={isPwdPending}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '14px 28px',
                background: isPwdPending ? '#9ca3af' : '#1e293b',
                border: 'none', borderRadius: '14px', color: 'white',
                fontSize: '15px', fontWeight: '600', cursor: isPwdPending ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                transition: 'background 0.2s',
              }}
            >
              <Save size={18} />
              {isPwdPending ? tr.updatingPwd : tr.updatePwd}
            </button>
          </div>
        </form>
      </div>

    </div>
  )
}
