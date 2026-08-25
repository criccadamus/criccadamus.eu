export interface PlaylistItem {
  videoId: string;
  playlistId: string;
  title: string;
}

interface ParsedYouTubeIds {
  videoId: string;
  playlistId: string;
}

function parseYouTubeUrl(url: string): ParsedYouTubeIds {
  const urlParams = new URLSearchParams(url.split("?")[1]);
  const videoId = urlParams.get("v") || "";
  const playlistId = urlParams.get("list") || "";
  return { videoId, playlistId };
}

export const playlistItems: PlaylistItem[] = [
  {
    ...parseYouTubeUrl(
      "https://www.youtube.com/watch?v=BBxqw9r5FZU&list=PLoGa9G4mB1GhdBdQdwnrnyYZLdCrQENxo",
    ),
    title: "FFXIV: Dawntrail post-game",
  },
  {
    ...parseYouTubeUrl(
      "https://www.youtube.com/watch?v=tC_akewvR0o&list=PLoGa9G4mB1GhuIYeYE-6WKmQbe7Ags6OC",
    ),
    title: "FFXIV: Dawntrail MSQ",
  },
  {
    ...parseYouTubeUrl(
      "https://www.youtube.com/watch?v=O4jALVwmpGA&list=PLoGa9G4mB1Gha-vfKxoS8yHWYCeUd4ZYk",
    ),
    title: "FFXIV: Endwalker",
  },
  {
    ...parseYouTubeUrl(
      "https://www.youtube.com/watch?v=6mgUiB2Fuao&list=PLoGa9G4mB1GgUtOByPIgVHFpM-JrnKVxr",
    ),
    title: "FFXVI",
  },
  {
    ...parseYouTubeUrl(
      "https://www.youtube.com/watch?v=OTArZvgOSYg&list=PLoGa9G4mB1Gjp1XLknZJPNskHtgpg-gko",
    ),
    title: "Crisis Core: a FF Story",
  },
  {
    ...parseYouTubeUrl(
      "https://www.youtube.com/watch?v=4FJjiFFe4xg&list=PLoGa9G4mB1GiCRnSKzuIJ3ilHrsfdFGP9",
    ),
    title: "FFXV",
  },
  {
    ...parseYouTubeUrl(
      "https://www.youtube.com/watch?v=xDp9uChxJls&list=PLoGa9G4mB1GhCiHDLtemmfq6b1cge42AW",
    ),
    title: "FFVII Remake",
  },
];
