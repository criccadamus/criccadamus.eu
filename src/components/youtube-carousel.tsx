import * as React from "react";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

interface PlaylistItem {
  videoId: string;
  playlistId: string;
  title: string;
}

function parseYouTubeUrl(url: string): { videoId: string; playlistId: string } {
  const urlParams = new URLSearchParams(url.split("?")[1]);
  const videoId = urlParams.get("v") || "";
  const playlistId = urlParams.get("list") || "";
  return { videoId, playlistId };
}

export function YouTubeCarousel() {
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const items: PlaylistItem[] = [
    {
      ...parseYouTubeUrl(
        "https://www.youtube.com/watch?v=BBxqw9r5FZU&list=PLoGa9G4mB1GhdBdQdwnrnyYZLdCrQENxo"
      ),
      title: "FFXIV: Dawntrail post-game",
    },
    {
      ...parseYouTubeUrl(
        "https://www.youtube.com/watch?v=tC_akewvR0o&list=PLoGa9G4mB1GhuIYeYE-6WKmQbe7Ags6OC"
      ),
      title: "FFXIV: Dawntrail MSQ",
    },
    {
      ...parseYouTubeUrl(
        "https://www.youtube.com/watch?v=O4jALVwmpGA&list=PLoGa9G4mB1Gha-vfKxoS8yHWYCeUd4ZYk"
      ),
      title: "FFXIV: Endwalker",
    },
    {
      ...parseYouTubeUrl(
        "https://www.youtube.com/watch?v=6mgUiB2Fuao&list=PLoGa9G4mB1GgUtOByPIgVHFpM-JrnKVxr"
      ),
      title: "FFXVI",
    },
    {
      ...parseYouTubeUrl(
        "https://www.youtube.com/watch?v=tC_akewvR0o&list=PLoGa9G4mB1GhuIYeYE-6WKmQbe7Ags6OC"
      ),
      title: "Crisis Core: a FF Story",
    },
    {
      ...parseYouTubeUrl(
        "https://www.youtube.com/watch?v=4FJjiFFe4xg&list=PLoGa9G4mB1GiCRnSKzuIJ3ilHrsfdFGP9"
      ),
      title: "FFXV",
    },
    {
      ...parseYouTubeUrl(
        "https://www.youtube.com/watch?v=xDp9uChxJls&list=PLoGa9G4mB1GhCiHDLtemmfq6b1cge42AW"
      ),
      title: "FFVII Remake",
    },
  ];

  const nextItem = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const prevItem = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const currentItem = items[currentIndex];
  const embedUrl = `https://www.youtube.com/embed/${currentItem.videoId}?list=${currentItem.playlistId}&mute=1`;

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border">
      <h2 className="sr-only">Youtube</h2>
      <iframe
        key={currentIndex}
        src={embedUrl}
        title={currentItem.title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="h-full w-full border-0"
      />

      {/* Floating navigation buttons */}
      {items.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={prevItem}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
          >
            <IconChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={nextItem}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
          >
            <IconChevronRight className="h-5 w-5" />
          </Button>

          {/* Item counter */}
          <div className="absolute bottom-2 right-2 rounded-md bg-black/50 px-2 py-1 text-xs text-white">
            {currentIndex + 1} / {items.length}
          </div>
        </>
      )}
    </div>
  );
}
