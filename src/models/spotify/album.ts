import {ArtistLight} from './artist';
import {Image} from './image';

type Album = {
  album_type: string;
  artists: ArtistLight[];
  id: string;
  images: Image[];
  name: string;
  release_date: string;
  total_tracks: number;
  type: string;
  uri: string;
};

export type {Album};
