import {useContext} from 'react';
import {PaletteContext} from 'contexts';

const usePalette = () => useContext(PaletteContext);

export {usePalette};
