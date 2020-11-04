import {Artist, Image} from 'models';

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

export type {Track};
