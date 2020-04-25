import {useContext, createContext, Dispatch, SetStateAction} from 'react';

type PaletteContextValue = {
  palette: string[];
  setPalette: Dispatch<SetStateAction<string[]>>;
};

const PaletteContext = createContext<PaletteContextValue>({palette: [], setPalette: () => {}});

const usePalette = () => useContext(PaletteContext);

export {PaletteContext, usePalette};
