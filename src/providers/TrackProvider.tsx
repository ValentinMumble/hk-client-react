import React, {useState, ReactNode} from 'react';
import {TrackContext} from 'contexts';
import {Track} from 'models';

type TrackProviderProps = {
  children?: ReactNode;
};

const TrackProvider = ({children}: TrackProviderProps) => {
  const [track, setTrack] = useState<Track>();

  return <TrackContext.Provider value={[track, setTrack]}>{children}</TrackContext.Provider>;
};

export {TrackProvider};
