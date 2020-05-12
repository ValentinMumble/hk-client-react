import {createContext, Dispatch, SetStateAction} from 'react';
import {Track} from 'models';

type TrackContextValue = [Track | undefined, Dispatch<SetStateAction<Track | undefined>>];

const TrackContext = createContext<TrackContextValue | undefined>(undefined);

export type {TrackContextValue};
export {TrackContext};
