'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Image as ImageIcon, Trash2, Calendar, MapPin, Plus, Maximize2, X } from 'lucide-react'

interface MediaItem {
  id: string
  filepath: string
  filename: string
  activityTitle: string
  activityDate: string
  className: string
}

export default function TeacherGalleryClient({ initialMedia }: { initialMedia: MediaItem[] }) {
  const router = useRouter()
  const [mediaList, setMediaList] = useState<MediaItem[]>(initialMedia)
  const [selectedPhoto, setSelectedPhoto] = useState<MediaItem | null>(null)

  // Quick navigation to activities to upload new photos
  const handleAddPhotos = () => {
    router.push('/teacher/activities')
  }

  return (
    <div>
      {/* Controls */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
        <button
          onClick={handleAddPhotos}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px',
            background: 'linear-gradient(135deg, #F72585, #4361EE)',
            border: 'none', borderRadius: '14px', color: 'white',
            fontSize: '14px', fontWeight: '700', cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(247,37,133,0.3)', transition: 'transform 0.15s ease'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <Plus size={18} /> Associer des photos à une activité
        </button>
      </div>

      {/* Gallery Grid */}
      {mediaList.length === 0 ? (
        <div
          style={{
            background: 'white', borderRadius: '24px', padding: '80px 40px',
            textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
            border: '1px solid rgba(0,0,0,0.02)'
          }}
        >
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <ImageIcon size={40} color="#94a3b8" />
          </div>
          <p style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: '0 0 8px' }}>Aucune photo</p>
          <p style={{ color: '#64748b', margin: 0, fontSize: '15px' }}>
            Les photos que vous ajoutez à vos activités apparaîtront ici.
          </p>
          <button
            onClick={handleAddPhotos}
            style={{
              marginTop: '24px', padding: '12px 24px', borderRadius: '12px',
              background: '#f8fafc', border: '1px solid #e2e8f0', color: '#374151',
              fontSize: '14px', fontWeight: '600', cursor: 'pointer'
            }}
          >
            Créer une activité
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
          {mediaList.map((item) => (
            <div
              key={item.id}
              className="gallery-card"
              onClick={() => setSelectedPhoto(item)}
              style={{
                aspectRatio: '1', borderRadius: '20px', overflow: 'hidden',
                position: 'relative', background: '#f8fafc', cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)', transition: 'all 0.3s ease',
                border: '1px solid rgba(0,0,0,0.02)'
              }}
            >
              <img
                src={item.filepath}
                alt={item.filename}
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                className="gallery-img"
              />
              <div
                style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(to top, rgba(15,23,42,0.8) 0%, rgba(15,23,42,0.2) 50%, transparent 100%)',
                }}
              />
              <div
                style={{
                  position: 'absolute', top: '12px', right: '12px',
                  background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)',
                  borderRadius: '50%', padding: '6px', color: 'white',
                  opacity: 0, transform: 'scale(0.8)', transition: 'all 0.2s ease'
                }}
                className="expand-icon"
              >
                <Maximize2 size={16} />
              </div>
              <div
                style={{
                  position: 'absolute', bottom: '16px', left: '16px', right: '16px',
                  display: 'flex', flexDirection: 'column', gap: '4px'
                }}
              >
                <p style={{ margin: 0, fontSize: '14px', color: 'white', fontWeight: '700', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.activityTitle}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: '#cbd5e1', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={12} /> {new Date(item.activityDate).toLocaleDateString('fr-FR')}
                  </span>
                  <span style={{ fontSize: '10px', color: '#cbd5e1', background: 'rgba(255,255,255,0.15)', padding: '2px 6px', borderRadius: '4px', fontWeight: '600' }}>
                    {item.className}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.95)', backdropFilter: 'blur(10px)',
            zIndex: 9999, display: 'flex', flexDirection: 'column',
            animation: 'fadeIn 0.2s ease'
          }}
        >
          {/* Top Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 32px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ color: 'white' }}>
              <h3 style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: '700' }}>{selectedPhoto.activityTitle}</h3>
              <div style={{ display: 'flex', gap: '12px', fontSize: '13px', color: '#94a3b8', fontWeight: '500' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={14} /> {new Date(selectedPhoto.activityDate).toLocaleDateString('fr-FR')}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={14} /> {selectedPhoto.className}</span>
              </div>
            </div>
            <button
              onClick={() => setSelectedPhoto(null)}
              style={{
                background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%',
                width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', cursor: 'pointer', transition: 'background 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            >
              <X size={24} />
            </button>
          </div>
          
          {/* Image */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', overflow: 'hidden' }} onClick={() => setSelectedPhoto(null)}>
            <img
              src={selectedPhoto.filepath}
              alt={selectedPhoto.filename}
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 24px 60px rgba(0,0,0,0.5)' }}
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the image
            />
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .gallery-card:hover { transform: translateY(-4px); box-shadow: 0 12px 24px rgba(0,0,0,0.1) !important; }
        .gallery-card:hover .gallery-img { transform: scale(1.05); }
        .gallery-card:hover .expand-icon { opacity: 1 !important; transform: scale(1) !important; }
      `}</style>
    </div>
  )
}
