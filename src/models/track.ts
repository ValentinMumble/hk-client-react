type Image = {
  url: string;
};

type Artist = {
  name: string;
};

type Album = {
  images: Image[];
};

type Track = {
  uri: string;
  name: string;
  artists: Artist[];
  album: Album;
  duration_ms: number;
};

const isTrack = (thing: any): thing is Track => undefined !== (thing as Track).uri;

export type {Track};
export {isTrack};
