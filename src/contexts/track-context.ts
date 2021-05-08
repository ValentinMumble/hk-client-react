import {createContext, Dispatch, SetStateAction} from 'react';

type TrackContextValue = [
  SpotifyApi.TrackObjectFull | undefined,
  Dispatch<SetStateAction<SpotifyApi.TrackObjectFull | undefined>>
];

const TrackContext = createContext<TrackContextValue | undefined>(undefined);

export type {TrackContextValue};
export {TrackContext};
