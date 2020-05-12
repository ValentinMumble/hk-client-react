import {createContext, Dispatch, SetStateAction} from 'react';

type PaletteContextValue = [string[], Dispatch<SetStateAction<string[]>>];

const PaletteContext = createContext<PaletteContextValue | undefined>(undefined);

export type {PaletteContextValue};
export {PaletteContext};
