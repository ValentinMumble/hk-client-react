import {useState, useEffect, ReactNode, useCallback} from 'react';
import styled from 'styled-components';
import {Snackbar, SnackbarContent, useTheme} from '@material-ui/core';
import {SnackbarContext} from 'contexts';
import {useToggle} from 'hooks';

type Snack = {
  message?: ReactNode;
  color?: string;
  backgroundColor?: string;
  duration?: number;
};

type SnickersProps = {background?: string; color?: string};
const Snickers = styled(SnackbarContent)<SnickersProps>`
  background-color: ${({background}) => background};
  color: ${({color}) => color};
  max-width: 90vw;
  font-size: 2vh;
`;

type SnackbarProviderProps = {
  children?: ReactNode;
};

const SnackbarProvider = ({children}: SnackbarProviderProps) => {
  const [snackbar, setSnackbar] = useState<Snack>({});
  const [isOpen, showSnack, hideSnack] = useToggle();
  const theme = useTheme();

  const snack = useCallback(
    (message: ReactNode, duration = 2000, backgroundColor = theme.palette.primary.main) => {
      if (message)
        setSnackbar(snackbar => ({
          ...snackbar,
          message,
          duration,
          backgroundColor,
          color: 'transparent' === backgroundColor ? 'inherit' : theme.palette.getContrastText(backgroundColor),
        }));
    },
    [theme.palette]
  );

  useEffect(() => {
    if (snackbar.message) showSnack();
  }, [snackbar]);

  return (
    <SnackbarContext.Provider value={snack}>
      {children}
      <Snackbar
        anchorOrigin={{vertical: 'bottom', horizontal: 'center'}}
        open={isOpen}
        autoHideDuration={snackbar.duration}
        onClose={hideSnack}
      >
        <Snickers background={snackbar.backgroundColor} color={snackbar.color} message={snackbar.message} />
      </Snackbar>
    </SnackbarContext.Provider>
  );
};

export {SnackbarProvider};
