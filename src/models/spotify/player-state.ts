import {Device} from './device';
import {Track} from './track';

type PlayerState = {
  device: Device;
  progress_ms: number;
  item: Track;
  is_playing: boolean;
  shuffle_state: boolean;
};

export type {PlayerState};
