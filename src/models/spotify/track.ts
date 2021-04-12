import {ArtistLight} from './artist';
import {Image} from './image';

type Album = {
  images: Image[];
};

type Track = {
  uri: string;
  name: string;
  artists: ArtistLight[];
  album: Album;
  duration_ms: number;
};

export type {Track};
