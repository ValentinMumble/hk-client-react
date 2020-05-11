import {useContext} from 'react';
import {SnackbarContext} from 'contexts';

const useSnackbar = () => useContext(SnackbarContext);

export {useSnackbar};
