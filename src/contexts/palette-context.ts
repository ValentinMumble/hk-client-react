import {createContext, Dispatch, SetStateAction} from 'react';

type PaletteContextValue = {
  palette: string[];
  setPalette: Dispatch<SetStateAction<string[]>>;
};

const PaletteContext = createContext<PaletteContextValue>({palette: [], setPalette: () => {}});

export {PaletteContext};
