import { createMuiTheme } from '@material-ui/core'

export const withPrimary = color => {
  return createMuiTheme({
    typography: {
      fontFamily: 'inherit'
    },
    palette: {
      primary: { main: color },
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
          margin: '30px 0',
          lineHeight: 'inherit'
        }
      },
      MuiSnackbarContent: {
        root: {
          maxWidth: '85vw'
        }
      },
      MuiPaper: {
        root: {
          backgroundColor: '#1c1c1c'
        }
      },
      MuiLinearProgress: {
        root: {
          flexGrow: 1
        }
      }
    }
  })
}
