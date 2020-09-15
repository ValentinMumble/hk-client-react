import {Track, Device} from 'models';

type PlayerState = {
  device: Device;
  progress_ms: number;
  item: Track;
  is_playing: boolean;
};

export type {PlayerState};
