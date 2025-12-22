export function TwitchEmbed() {
  return (
    <div className="aspect-video w-full">
      <h2 className="sr-only">Twitch</h2>
      <iframe
        src="https://player.twitch.tv/?channel=criccadamus&parent=criccadamus.eu&parent=localhost"
        height="100%"
        width="100%"
        allowFullScreen
        className="border-0"
        title="Twitch Stream"
      />
    </div>
  )
}
