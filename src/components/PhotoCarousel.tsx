'use client'

import { useState, useEffect } from 'react'

export interface PhotoItem {
  src: string
  objectPosition?: string
}

interface PhotoCarouselProps {
  photos: Array<string | PhotoItem>
  alt?: string
}

export default function PhotoCarousel({ photos, alt = '' }: PhotoCarouselProps) {
  const items: PhotoItem[] = photos.map((p) => (typeof p === 'string' ? { src: p } : p))
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (items.length <= 1) return
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [items.length])

  if (items.length === 0) return null

  return (
    <div className="relative rounded-2xl overflow-hidden shadow-lg aspect-[4/3] md:aspect-[21/9]">
      <div className="absolute inset-0">
        {items.map((item, i) => (
          <img
            key={item.src}
            src={item.src}
            alt={alt}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
            style={{
              opacity: i === currentIndex ? 1 : 0,
              objectPosition: item.objectPosition ?? 'center',
            }}
          />
        ))}
      </div>

      {items.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className="w-2 h-2 rounded-full transition-all"
              style={{
                backgroundColor: i === currentIndex ? 'white' : 'rgba(255,255,255,0.4)',
              }}
              aria-label={`Show photo ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
