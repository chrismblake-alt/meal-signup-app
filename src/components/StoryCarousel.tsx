'use client'

import { useState, useEffect } from 'react'

interface Story {
  id: string
  title: string
  content: string
  imageUrl: string | null
}

interface StoryCarouselProps {
  stories: Story[]
}

export default function StoryCarousel({ stories }: StoryCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (stories.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % stories.length)
    }, 8000)

    return () => clearInterval(interval)
  }, [stories.length])

  if (stories.length === 0) {
    return null
  }

  const currentStory = stories[currentIndex]

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-4 text-center">Impact Stories</h2>

      <div className="relative overflow-hidden">
        <div className="flex flex-col md:flex-row gap-6 items-center">
          {currentStory.imageUrl && (
            <div className="w-full md:w-1/3 flex-shrink-0">
              <img
                src={currentStory.imageUrl}
                alt={currentStory.title}
                className="w-full h-48 object-cover rounded-lg"
              />
            </div>
          )}
          <div className={currentStory.imageUrl ? 'md:w-2/3' : 'w-full'}>
            <h3 className="font-semibold text-lg mb-2 text-[#e31837]">{currentStory.title}</h3>
            <p className="text-gray-600 leading-relaxed">{currentStory.content}</p>
          </div>
        </div>
      </div>

      {stories.length > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {stories.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-[#e31837]' : 'bg-gray-300'
              }`}
              aria-label={`Go to story ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
