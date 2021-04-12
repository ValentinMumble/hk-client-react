import {Image} from 'models';

type Artist = {
  id: string;
  name: string;
  images: Image[];
};

type ArtistLight = Omit<Artist, 'images'>;

export type {Artist, ArtistLight};
