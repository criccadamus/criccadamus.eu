import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function TwitchEmbed() {
  const [isLoading, setIsLoading] = React.useState(true);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border">
      <h2 className="sr-only">Twitch</h2>
      {isLoading && <Skeleton className="absolute inset-0" />}
      <iframe
        src="https://player.twitch.tv/?channel=criccadamus&parent=criccadamus.eu&parent=localhost"
        height="100%"
        width="100%"
        allowFullScreen
        className="border-0"
        title="Twitch Stream"
        onLoad={() => setIsLoading(false)}
      />
    </div>
  );
}
