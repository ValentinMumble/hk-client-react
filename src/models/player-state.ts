type PlayerState = {
  device: {
    volume_percent: number;
  };
  progress_ms: number;
  item: {
    duration_ms: number;
  };
};

export type {PlayerState};
