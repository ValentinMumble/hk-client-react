import {Album} from './album';
import {ArtistLight} from './artist';

type Search = {
  value: string;
  artist?: ArtistLight;
  album?: Album;
};

export type {Search};
