import { useState } from 'react';

interface ImageGalleryProps {
  images: string[];
}

export default function ImageGallery({ images }: ImageGalleryProps) {
  const [activeImage, setActiveImage] = useState<string | null>(images[0] || null);

  if (images.length === 0) {
    return null;
  }

  return (
    <section className="glass-card" style={{ marginBottom: 'var(--space-xl)' }}>
      <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: 'var(--space-md)' }}>Product Media</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
        {/* Main image view */}
        <div 
          style={{ 
            width: '100%', 
            height: '350px', 
            borderRadius: 'var(--radius-md)', 
            overflow: 'hidden', 
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)'
          }}
        >
          <img 
            src={activeImage || images[0]} 
            alt="Product detail view"
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div style={{ display: 'flex', gap: 'var(--space-xs)', overflowX: 'auto', paddingBottom: '4px' }}>
            {images.map((img, index) => (
              <button
                key={index}
                onClick={() => setActiveImage(img)}
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: 'var(--radius-sm)',
                  overflow: 'hidden',
                  border: activeImage === img ? '2px solid var(--accent-cyan)' : '1px solid var(--border-default)',
                  cursor: 'pointer',
                  padding: 0,
                  background: 'none'
                }}
              >
                <img src={img} alt={`Thumb ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
