import {I} from 'utils';

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

const emptyTrack: Track = {
  uri: '',
  name: '',
  artists: [{name: ''}],
  album: {images: [{url: I.BLACK}]},
  duration_ms: 0,
};

export type {Track};
export {emptyTrack};
