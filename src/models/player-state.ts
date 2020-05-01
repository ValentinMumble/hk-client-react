import {Track} from 'models';

type PlayerState = {
  device: {
    volume_percent: number;
  };
  progress_ms: number;
  item: Track;
  is_playing: boolean;
};

export type {PlayerState};
