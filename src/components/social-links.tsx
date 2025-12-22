import * as React from 'react'
import { IconCopy, IconExternalLink } from '@tabler/icons-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export function SocialLinks() {
  const [twitterHovered, setTwitterHovered] = React.useState(false)
  const [discordHovered, setDiscordHovered] = React.useState(false)

  const copyDiscordUsername = () => {
    navigator.clipboard.writeText('criccadamus')
    toast('Discord username copied!', {
      description: 'criccadamus',
    })
  }

  return (
    <div className="space-y-4">
      <h2 className="sr-only">Links</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Twitter Button */}
        <a
          href="https://twitter.com/criccadamus"
          target="_blank"
          rel="noopener noreferrer"
          onMouseEnter={() => setTwitterHovered(true)}
          onMouseLeave={() => setTwitterHovered(false)}
          className={cn(
            'group relative flex flex-col items-center justify-center',
            'bg-card border border-border rounded-lg p-12 aspect-square',
            'transition-all duration-300 ease-in-out',
            'hover:border-[#1DA1F2] hover:bg-[#1DA1F2]/10',
            'cursor-pointer',
          )}
        >
          <div className="absolute top-4 right-4 opacity-50 group-hover:opacity-100 transition-opacity">
            <IconExternalLink className="h-5 w-5 text-foreground group-hover:text-[#1DA1F2]" />
          </div>
          <div className="w-32 h-32 relative">
            <img
              src="/icon/twitter.svg"
              alt="Twitter"
              className="w-full h-full absolute inset-0 transition-opacity duration-300 text-[#1DA1F2]"
            />
          </div>
        </a>

        {/* Discord Button */}
        <button
          onClick={copyDiscordUsername}
          onMouseEnter={() => setDiscordHovered(true)}
          onMouseLeave={() => setDiscordHovered(false)}
          className={cn(
            'group relative flex flex-col items-center justify-center',
            'bg-card border border-border rounded-lg p-12 aspect-square',
            'transition-all duration-300 ease-in-out',
            'hover:border-[#5865F2] hover:bg-[#5865F2]/10',
            'cursor-pointer',
          )}
        >
          <div className="absolute top-4 right-4 opacity-50 group-hover:opacity-100 transition-opacity">
            <IconCopy className="h-5 w-5 text-foreground group-hover:text-[#5865F2]" />
          </div>
          <div className="w-32 h-32 relative">
            <img
              src="/icon/discord.svg"
              alt="Discord"
              className="w-full h-full absolute inset-0 transition-opacity duration-300 text-[#7289DA]"
            />
          </div>
        </button>

        {/* AniList Button */}
        <a
          href="https://anilist.co/user/criccadamus/"
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            'group relative flex flex-col items-center justify-center',
            'bg-card border border-border rounded-lg p-12 aspect-square',
            'transition-all duration-300 ease-in-out',
            'hover:border-[#02A9FF] hover:bg-[#02A9FF]/10',
            'cursor-pointer',
          )}
        >
          <div className="absolute top-4 right-4 opacity-50 group-hover:opacity-100 transition-opacity">
            <IconExternalLink className="h-5 w-5 text-foreground group-hover:text-[#02A9FF]" />
          </div>
          <img src="/icon/anilist.svg" alt="AniList" className="w-32 h-32" />
        </a>
      </div>
    </div>
  )
}
