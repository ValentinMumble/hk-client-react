import {Album} from './album';
import {ArtistLight} from './artist';

type Track = {
  album?: Album;
  artists: ArtistLight[];
  disc_number: number;
  duration_ms: number;
  explicit: boolean;
  id: string;
  is_playable: boolean;
  name: string;
  popularity: number;
  track_number: number;
  type: string;
  uri: string;
};

export type {Track};
