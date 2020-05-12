import {useContext} from 'react';
import {TrackContext, TrackContextValue} from 'contexts';

const useTrack = (): TrackContextValue => {
  const track = useContext(TrackContext);

  if (!track) throw Error('Track not initialized properly');

  return track;
};

export {useTrack};
