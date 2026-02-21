'use client'

import { useState, useEffect } from 'react'

const PHOTOS = [
  '/photos/kids-1.jpg',
  '/photos/kids-2.jpg',
  '/photos/kids-3.jpg',
  '/photos/kids-4.jpg',
  '/photos/kids-5.jpg',
  '/photos/kids-6.jpg',
  '/photos/kids-7.jpg',
  '/photos/kids-8.jpg',
]

interface KidCountProps {
  min?: number
  max?: number
}

export default function KidCount({ min, max }: KidCountProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % PHOTOS.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative rounded-2xl overflow-hidden shadow-lg aspect-[4/3] md:aspect-[21/9]">
      {/* Background photo carousel */}
      <div className="absolute inset-0">
        {PHOTOS.map((src, i) => (
          <img
            key={src}
            src={src}
            alt=""
            className="absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-1000"
            style={{ opacity: i === currentIndex ? 1 : 0 }}
          />
        ))}
        {/* Subtle dark gradient for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/10" />
      </div>

      {/* Text content */}
      <div className="relative h-full flex flex-col items-center justify-end pb-10 px-4">
        <h2
          className="text-3xl md:text-4xl font-bold text-white text-center max-w-lg"
          style={{ textShadow: '0 2px 12px rgba(0,0,0,0.7), 0 1px 4px rgba(0,0,0,0.5)' }}
        >
          Our kids need dinner every night. Can you help?
        </h2>

        {/* Carousel dots */}
        <div className="flex justify-center gap-1.5 mt-5">
          {PHOTOS.map((_, i) => (
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
      </div>
    </div>
  )
}
