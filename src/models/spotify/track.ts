import {Album} from './album';
import {ArtistLight} from './artist';

type Track = {
  uri: string;
  name: string;
  artists: ArtistLight[];
  album?: Album;
  duration_ms: number;
};

export type {Track};
