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
      MuiIconButton: { color: 'primary' }
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
          height: 7
        },
        track: {
          height: 7
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
        h5: {
          fontSize: '.3em',
          margin: '40px 0'
        }
      }
    }
  })
}
