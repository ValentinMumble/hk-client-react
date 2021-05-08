import {useState, ReactNode, useEffect} from 'react';
import {ThemeProvider} from 'styled-components';
import {createMuiTheme, Theme, MuiThemeProvider, StylesProvider} from '@material-ui/core';
import {PaletteContext} from 'contexts';
import {api} from 'utils';

const withColors = (primary = '#000', secondary = '#000') =>
  createMuiTheme({
    typography: {
      fontFamily: 'inherit',
    },
    palette: {
      primary: {main: primary},
      secondary: {main: secondary},
      type: 'dark',
    },
    props: {
      MuiIconButton: {color: 'primary', centerRipple: false},
    },
    overrides: {
      MuiSvgIcon: {
        root: {
          fontSize: 'inherit',
        },
      },
      MuiIconButton: {
        root: {
          fontSize: 'inherit',
        },
      },
      MuiSlider: {
        root: {
          height: 8,
        },
        rail: {
          height: 7,
          borderRadius: 5,
        },
        track: {
          height: 7,
          borderRadius: 5,
        },
        thumb: {
          width: 36,
          height: 36,
          marginTop: -15,
          marginLeft: -18,
        },
        valueLabel: {
          left: 'calc(-50% + 19px)',
        },
      },
      MuiTouchRipple: {
        rippleVisible: {
          animationDuration: '400ms',
        },
      },
    },
  });

const postPalette = (palette: string[]) => api(['palette'], undefined, {method: 'POST', body: JSON.stringify(palette)});

type HKThemeProviderProps = {
  children?: ReactNode;
};

const HKThemeProvider = ({children}: HKThemeProviderProps) => {
  const [theme, setTheme] = useState<Theme>(withColors());
  const [palette, setPalette] = useState<string[]>([]);

  useEffect(() => {
    if (0 === palette.length) return;

    postPalette(palette);
    setTheme(withColors(palette[0], palette[1]));
  }, [palette]);

  return (
    <PaletteContext.Provider value={[palette, setPalette]}>
      <MuiThemeProvider theme={theme}>
        <ThemeProvider theme={theme}>
          <StylesProvider injectFirst>{children}</StylesProvider>
        </ThemeProvider>
      </MuiThemeProvider>
    </PaletteContext.Provider>
  );
};

export {HKThemeProvider};
