import {useContext} from 'react';
import {PaletteContext, PaletteContextValue} from 'contexts';

const usePalette = (): PaletteContextValue => {
  const palette = useContext(PaletteContext);

  if (!palette) throw Error('Palette not initialized properly');

  return palette;
};

export {usePalette};
