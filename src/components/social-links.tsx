import { IconCopy, IconExternalLink } from '@tabler/icons-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export function SocialLinks() {
  const copyDiscordUsername = () => {
    void navigator.clipboard.writeText('criccadamus')
    toast('Discord username copied!', {
      description: 'criccadamus',
    })
  }

  return (
    <div className="space-y-4">
      <h2 className="sr-only">Links</h2>

      <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
        {/* Twitter Button */}
        <a
          href="https://twitter.com/criccadamus"
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            'group relative flex flex-col items-center justify-center',
            'bg-card border border-border rounded-lg p-8 aspect-square',
            'transition-all duration-300 ease-in-out',
            'hover:border-[#1DA1F2] hover:bg-[#1DA1F2]/10',
            'cursor-pointer',
          )}
        >
          <div className="absolute top-2 right-2 md:top-3 md:right-3 opacity-50 group-hover:opacity-100 transition-opacity">
            <IconExternalLink className="h-4 w-4 md:h-5 md:w-5 text-foreground group-hover:text-[#1DA1F2]" />
          </div>
          <div className="w-full h-full max-w-24 max-h-24 relative text-[#1DA1F2] flex items-center justify-center">
            <svg
              className="w-full h-full max-w-full max-h-full object-contain"
              viewBox="0 0 24 24"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
            </svg>
          </div>
        </a>

        {/* Discord Button */}
        <button
          onClick={copyDiscordUsername}
          className={cn(
            'group relative flex flex-col items-center justify-center',
            'bg-card border border-border rounded-lg p-8 aspect-square',
            'transition-all duration-300 ease-in-out',
            'hover:border-[#5865F2] hover:bg-[#5865F2]/10',
            'cursor-pointer',
          )}
        >
          <div className="absolute top-2 right-2 md:top-3 md:right-3 opacity-50 group-hover:opacity-100 transition-opacity">
            <IconCopy className="h-4 w-4 md:h-5 md:w-5 text-foreground group-hover:text-[#5865F2]" />
          </div>
          <div className="w-full h-full max-w-24 max-h-24 relative text-[#7289DA] flex items-center justify-center">
            <svg
              className="w-full h-full max-w-full max-h-full object-contain"
              viewBox="0 0 24 24"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.043.107a14.283 14.283 0 0 0 1.227 1.994a.076.076 0 0 0 .084.028a19.853 19.853 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
            </svg>
          </div>
        </button>

        {/* AniList Button */}
        <a
          href="https://anilist.co/user/criccadamus/"
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            'group relative flex flex-col items-center justify-center',
            'bg-card border border-border rounded-lg p-8 aspect-square',
            'transition-all duration-300 ease-in-out',
            'hover:border-[#02A9FF] hover:bg-[#02A9FF]/10',
            'cursor-pointer',
          )}
        >
          <div className="absolute top-2 right-2 md:top-3 md:right-3 opacity-50 group-hover:opacity-100 transition-opacity">
            <IconExternalLink className="h-4 w-4 md:h-5 md:w-5 text-foreground group-hover:text-[#02A9FF]" />
          </div>
          <img
            src="/icon/anilist.svg"
            alt="AniList"
            className="w-full h-full max-w-24 max-h-24"
          />
        </a>
      </div>
    </div>
  )
}
