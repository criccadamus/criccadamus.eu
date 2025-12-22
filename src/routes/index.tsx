import { createFileRoute } from '@tanstack/react-router'
import { Header } from '@/components/criccahub/header'
import { SocialLinks } from '@/components/criccahub/social-links'
import { TwitchEmbed } from '@/components/criccahub/twitch-embed'
import { YouTubeCarousel } from '@/components/criccahub/youtube-carousel'

export const Route = createFileRoute('/')({ component: App })

function App() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <SocialLinks />
          <TwitchEmbed />
          <YouTubeCarousel />
        </div>
      </main>
    </div>
  )
}
