type SearchResult = {
  id: number;
  url: string;
  title: string;
  albumArt: string;
};

type LyricsSearch = {
  results: SearchResult[];
  top: string;
};

export type {LyricsSearch};
