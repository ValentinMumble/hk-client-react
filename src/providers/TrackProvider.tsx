import {useState, ReactNode} from 'react';
import {TrackContext} from 'contexts';

type TrackProviderProps = {
  children?: ReactNode;
};

const TrackProvider = ({children}: TrackProviderProps) => {
  const [track, setTrack] = useState<SpotifyApi.TrackObjectFull>();

  return <TrackContext.Provider value={[track, setTrack]}>{children}</TrackContext.Provider>;
};

export {TrackProvider};
