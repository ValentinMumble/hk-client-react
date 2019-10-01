import { createMuiTheme } from '@material-ui/core'

export const withPrimary = (primary, secondary = '#333') => {
  return createMuiTheme({
    typography: {
      fontFamily: 'inherit'
    },
    palette: {
      primary: { main: primary },
      secondary: { main: secondary },
      type: 'dark'
    },
    props: {
      MuiIconButton: { color: 'primary', centerRipple: false }
    },
    overrides: {
      MuiSvgIcon: {
        root: {
          fontSize: 'inherit'
        }
      },
      MuiIconButton: {
        root: {
          fontSize: 'inherit',
          transition: 'all .6s ease'
        }
      },
      MuiSlider: {
        root: {
          transition: 'all .6s ease'
        },
        rail: {
          height: 7,
          borderRadius: 5
        },
        track: {
          height: 7,
          borderRadius: 5
        },
        thumb: {
          width: 36,
          height: 36,
          marginTop: -15,
          marginLeft: -18
        },
        valueLabel: {
          left: 'calc(-50% + 19px)'
        }
      },
      MuiTypography: {
        root: {
          transition: 'all .6s ease'
        },
        h5: {
          fontSize: '2.5vh',
          margin: '15px 0',
          textAlign: 'center',
          height: 50,
          maxWidth: 450
        }
      },
      MuiSnackbarContent: {
        root: {
          maxWidth: '85vw'
        }
      },
      MuiLinearProgress: {
        root: {
          flexGrow: 1
        }
      },
      MuiTouchRipple: {
        rippleVisible: {
          animationDuration: '.3s'
        }
      },
      MuiTabs: {
        root: {
          minHeight: 'unset'
        }
      },
      MuiTab: {
        root: {
          minHeight: 30
        },
        textColorPrimary: {
          color: primary === '#000' ? primary : 'rgba(255, 255, 255, 0.3)'
        }
      }
    }
  })
}
