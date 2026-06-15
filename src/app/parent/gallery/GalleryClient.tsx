'use client'

import { useState } from 'react'
import { X, ZoomIn } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/LanguageContext'

interface MediaItem {
  id: string
  filepath: string
  filename: string
  activityTitle: string
}

interface GalleryClientProps {
  media: MediaItem[]
}

export default function GalleryClient({ media }: GalleryClientProps) {
  const [selected, setSelected] = useState<MediaItem | null>(null)
  const [filter, setFilter] = useState<string>('all')
  const { t } = useLanguage()

  const activities = Array.from(new Set(media.map((m) => m.activityTitle)))
  const filtered = filter === 'all' ? media : media.filter((m) => m.activityTitle === filter)

  return (
    <div>
      {/* Filter bar */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setFilter('all')}
          style={{
            padding: '8px 16px',
            borderRadius: '999px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '600',
            background: filter === 'all' ? 'linear-gradient(135deg, #F72585, #4361EE)' : '#f1f5f9',
            color: filter === 'all' ? 'white' : '#64748b',
            transition: 'all 0.15s',
          }}
        >
          {t.parent.gallery.filterAll}
        </button>
        {activities.map((act) => (
          <button
            key={act}
            onClick={() => setFilter(act)}
            style={{
              padding: '8px 16px',
              borderRadius: '999px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '600',
              background: filter === act ? 'linear-gradient(135deg, #F72585, #4361EE)' : '#f1f5f9',
              color: filter === act ? 'white' : '#64748b',
              transition: 'all 0.15s',
            }}
          >
            {act}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div
          style={{
            background: 'white',
            borderRadius: '20px',
            padding: '60px 40px',
            textAlign: 'center',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          }}
        >
          <p style={{ fontSize: '64px', margin: '0 0 16px' }}>🖼️</p>
          <p style={{ fontSize: '18px', fontWeight: '600', color: '#374151', margin: 0 }}>{t.parent.gallery.noPhotos}</p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '12px',
          }}
        >
          {filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelected(item)}
              style={{
                aspectRatio: '1',
                borderRadius: '16px',
                overflow: 'hidden',
                cursor: 'pointer',
                position: 'relative',
                background: '#f1f5f9',
                transition: 'transform 0.2s',
              }}
              onMouseOver={(e) => {
                ;(e.currentTarget as HTMLDivElement).style.transform = 'scale(1.03)'
                const overlay = e.currentTarget.querySelector('.photo-overlay') as HTMLDivElement
                if (overlay) overlay.style.opacity = '1'
              }}
              onMouseOut={(e) => {
                ;(e.currentTarget as HTMLDivElement).style.transform = 'scale(1)'
                const overlay = e.currentTarget.querySelector('.photo-overlay') as HTMLDivElement
                if (overlay) overlay.style.opacity = '0'
              }}
            >
              <img
                src={item.filepath}
                alt={item.filename}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div
                className="photo-overlay"
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(0,0,0,0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0,
                  transition: 'opacity 0.2s',
                }}
              >
                <ZoomIn size={28} color="white" />
              </div>
              <div
                style={{
                  position: 'absolute',
                  bottom: '8px',
                  insetInlineStart: '8px',
                  insetInlineEnd: '8px',
                  background: 'rgba(0,0,0,0.6)',
                  borderRadius: '8px',
                  padding: '4px 8px',
                }}
              >
                <p style={{ margin: 0, fontSize: '11px', color: 'white', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.activityTitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {selected && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.9)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setSelected(null)}
        >
          <button
            onClick={() => setSelected(null)}
            style={{
              position: 'absolute',
              top: '20px',
              insetInlineEnd: '20px',
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              borderRadius: '50%',
              width: '44px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={22} color="white" />
          </button>
          <img
            src={selected.filepath}
            alt={selected.filename}
            style={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              objectFit: 'contain',
              borderRadius: '12px',
            }}
            onClick={(e) => e.stopPropagation()}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '24px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(0,0,0,0.6)',
              borderRadius: '12px',
              padding: '8px 16px',
            }}
          >
            <p style={{ margin: 0, fontSize: '14px', color: 'white', fontWeight: '500' }}>
              {selected.activityTitle} — {selected.filename}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
