import * as React from 'react'
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import 'lite-youtube-embed/src/lite-yt-embed.css'
import 'lite-youtube-embed'

// Wrapper component for lite-youtube custom element
const LiteYouTube = React.forwardRef<
  HTMLElement,
  {
    videoid: string
    playlabel?: string
    title?: string
    'js-api'?: boolean
    params?: string
  }
>(({ videoid, playlabel, title, ...props }, ref) => {
  return React.createElement('lite-youtube', {
    ref,
    videoid,
    playlabel,
    title,
    ...props,
  } as any)
})

LiteYouTube.displayName = 'LiteYouTube'

export function YouTubeCarousel() {
  const [currentIndex, setCurrentIndex] = React.useState(0)

  // Add your YouTube video IDs here
  const videos = [
    {
      id: 'dQw4w9WgXcQ',
      title: 'Video 1',
    },
    {
      id: 'jNQXAC9IVRw',
      title: 'Video 2',
    },
    // Add more videos as needed
  ]

  const nextVideo = () => {
    setCurrentIndex((prev) => (prev + 1) % videos.length)
  }

  const prevVideo = () => {
    setCurrentIndex((prev) => (prev - 1 + videos.length) % videos.length)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>YouTube Videos</CardTitle>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={prevVideo}
              disabled={videos.length <= 1}
            >
              <IconChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={nextVideo}
              disabled={videos.length <= 1}
            >
              <IconChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="aspect-video w-full">
          <LiteYouTube
            videoid={videos[currentIndex].id}
            playlabel={`Play: ${videos[currentIndex].title}`}
            title={videos[currentIndex].title}
          />
        </div>
        {videos.length > 1 && (
          <div className="p-4 text-center text-sm text-muted-foreground">
            {currentIndex + 1} / {videos.length}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
