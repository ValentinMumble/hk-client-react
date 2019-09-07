import React, { Component } from 'react'
import './App.css'
import { withPrimary } from './theme'
import { api } from './util'
import openSocket from 'socket.io-client'
import { Snackbar, Slider, LinearProgress, IconButton, Typography, SnackbarContent, Popover } from '@material-ui/core'
import { ThemeProvider } from '@material-ui/styles'
import {
  RadioRounded,
  FavoriteRounded,
  MusicNoteRounded,
  BluetoothRounded,
  PowerSettingsNewRounded,
  VolumeDownRounded,
  VolumeUpRounded,
  NewReleasesRounded,
  SkipPreviousRounded,
  PlayArrowRounded,
  PauseRounded,
  SkipNextRounded,
  LockRounded,
  WbIncandescentRounded,
  Warning
} from '@material-ui/icons'
import Artwork from './Artwork'

const {
  REACT_APP_SERVER_URL: SERVER,
  REACT_APP_HK_API: HK
} = process.env

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      snackbar: { opened: false, color: '#000' },
      popover: { opened: false },
      theme: withPrimary('#000')
    }
    this.colors = ['transparent', '#ffffff', '#ffaa71', '#01a7c2', '#ff96ca']
  }
  componentDidMount() {
    api(`${SERVER}/spotify/access-token`).then(data => {
      if (data.url) {
        this.setState({ authorized: false, authorizeUrl: data.url, theme: withPrimary('#777') })
      } else {
        this.setupConnect(data.accessToken)
      }
    })
    document.addEventListener('visibilitychange', this.onVisibilityChange)
  }
  setProgress = progress => this.setState({ progress })
  setPlayback = isPlaying => this.setState({ isPlaying })
  setDevice = device => this.setState({ device })
  setVolume = volume => this.setState({ volume })
  setTrack = activeTrack => this.setState({ activeTrack })
  emit = (event, value) => {
    console.info('Emit', event, value)
    this.io.emit(event, value)
    switch (event) {  // optimistic updates
      case 'play': this.setPlayback(true)
        break
      case 'pause': this.setPlayback(false)
        break
      default:
        break
    }
  }
  onError = error => {
    if (error.name === 'NoAccessToken') {
      this.emit('initiate', { accessToken: this.accessToken })
    } else if (error.name === 'NoActiveDeviceError') {
      this.setState({ loading: true })
      this.emit('transfer_playback', { id: process.env.REACT_APP_SPO_PI_ID })
    } else if (error === 'The access token expired') {
      this.refreshToken()
    } else {
      this.setState({ error: error.message || error })
    }
  }
  refreshToken = () => {
    console.info('Refreshing token...')
    api(`${SERVER}/spotify/refresh-token`).then(data => {
      this.accessToken = data.accessToken
      this.emit('access_token', this.accessToken)
    })
  }
  login = () => {
    return new Promise((resolve, reject) => {
      const popup = window.open(this.state.authorizeUrl, '_blank', 'width=500,height=500,location=0,resizable=0')
      const listener = setInterval(() => {
        if (popup) popup.postMessage('login', window.location)
      }, 1000)
      window.onmessage = event => {
        if (event.source === popup) {
          clearInterval(listener)
          window.onmessage = null
          return resolve(JSON.parse(event.data))
        }
      }
    })
  }
  setupConnect = accessToken => {
    this.accessToken = accessToken
    this.io = openSocket(`${SERVER}/connect`, { reconnection: false })
    const wrappedHandler = (event, handler) => {
      this.io.on(event, data => {
        console.info(event, data)
        handler(data)
      })
    }
    wrappedHandler('initial_state', state => this.setState({ loading: false, authorized: true, progress: state.progress_ms, activeTrack: state.item, volume: state.device.volume_percent, device: state.device, isPlaying: state.is_playing }))
    wrappedHandler('track_change', this.setTrack)
    wrappedHandler('seek', this.setProgress)
    wrappedHandler('playback_started', () => this.setPlayback(true))
    wrappedHandler('playback_paused', () => this.setPlayback(false))
    wrappedHandler('device_change', this.setDevice)
    wrappedHandler('volume_change', this.setVolume)
    wrappedHandler('track_end', () => { })
    wrappedHandler('connect_error', this.onError)
    wrappedHandler('disconnect', () => { })
    this.emit('initiate', { accessToken: this.accessToken })
  }
  snack = (message, duration = 2000, color = this.state.theme.palette.primary.main) => {
    if (message) this.setState({ snackbar: { ...this.state.snackbar, opened: true, message, duration, color } })
  }
  onApi = json => {
    this.snack(json.error ? <span className="Warning"><Warning fontSize="small" /> {json.error.message || json.error}</span> : json.message)
  }
  onHueClick = color => {
    if (color === 'transparent') {
      this.setState({ popover: { ...this.state.popover, opened: false } })
      api(`${SERVER}/hue/off`).then(this.onApi)
    } else {
      api(`${SERVER}/hue/on/${color.substring(1)}`).then(this.onApi)
      this.snack('Turning lights on...', 1000, color)
    }
  }
  onVisibilityChange = () => {
    if (document.visibilityState === 'visible' && this.io && this.io.disconnected) {
      console.info('Socket disconnected, reconnecting now...')
      this.setState({ loading: true })
      this.io.open()
      this.emit('initiate', { accessToken: this.accessToken })
    }
  }
  render() {
    const {
      theme,
      isPlaying,
      activeTrack,
      snackbar,
      popover
    } = this.state,
      colors = Array.from(this.colors)
    colors.push(theme.palette.primary.main)
    return (
      <ThemeProvider theme={theme}>
        <div className="App">
          <main>
            <Snackbar
              anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
              autoHideDuration={snackbar.duration}
              open={snackbar.opened}
              onClose={() => this.setState({ snackbar: { ...snackbar, opened: false } })}>
              <SnackbarContent
                style={{ backgroundColor: snackbar.color, color: theme.palette.getContrastText(snackbar.color) }}
                message={snackbar.message} />
            </Snackbar>
            <Popover
              anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
              transformOrigin={{ vertical: 'top', horizontal: 'center' }}
              anchorEl={popover.anchorEl}
              open={popover.opened}
              onClose={() => this.setState({ popover: { ...popover, opened: false } })}>
              <div className="Colors">
                {colors.map((color, i) => <div key={i} style={{ backgroundColor: color }} onClick={() => this.onHueClick(color)}></div>)}
              </div>
            </Popover>
            <div className="Container">
              <div className="Container Top">
                <div className="Small">
                  <IconButton onClick={() => api(`${HK}/source/Radio`).then(this.onApi)}>
                    <RadioRounded />
                  </IconButton>
                  <IconButton onClick={() => api(`${HK}/source/TV`).then(this.onApi)}>
                    <MusicNoteRounded />
                  </IconButton>
                  <IconButton onClick={(e) => this.setState({ popover: { ...popover, opened: !this.state.popover.opened, anchorEl: e.currentTarget } })}>
                    <WbIncandescentRounded />
                  </IconButton>
                  <IconButton onClick={() => api(`${SERVER}/bluetooth/reset`).then(this.onApi)}>
                    <BluetoothRounded />
                  </IconButton>
                  <IconButton onClick={() => api(`${HK}/off`).then(this.onApi)}>
                    <PowerSettingsNewRounded />
                  </IconButton>
                </div>
                <div className="Large">
                  <IconButton onClick={() => api(`${HK}/volume/down`).then(this.onApi)}>
                    <VolumeDownRounded />
                  </IconButton>
                  <IconButton onClick={() => api(`${HK}/volume/up`).then(this.onApi)}>
                    <VolumeUpRounded />
                  </IconButton>
                </div>
              </div>
              {this.state.authorized ? (
                activeTrack ? (
                  <div className="Container">
                    {this.state.loading && <div className="Loader">
                      <LinearProgress color="secondary" />
                    </div>}
                    <Artwork onClick={() => api(`${SERVER}/soca/count`).then(json => this.onApi({ ...json, message: `${json.clientsCount} client${json.clientsCount > 1 ? 's' : ''} connected` }))}
                      src={activeTrack.album.images.length > 0 ? activeTrack.album.images[0].url : ''}
                      isPlaying={isPlaying}
                      trackDuration={activeTrack.duration_ms}
                      progress={this.state.progress}
                      onColorChange={color => this.setState({ theme: withPrimary(color) })}
                    />
                    <Typography className="Title" variant="h5" color="primary"
                      onClick={() => api(`${SERVER}/spotify/addok/${activeTrack.uri}`).then(this.onApi)}>
                      {activeTrack.name}<br /><span className="Dark">{activeTrack.artists[0].name}</span>
                    </Typography>
                    <div className="Controls Small">
                      <IconButton onClick={() => this.emit('play', { context_uri: process.env.REACT_APP_SPO_DISCOVER_WEEKLY_URI })}>
                        <NewReleasesRounded />
                      </IconButton>
                      <IconButton onClick={() => this.emit('previous_track')}>
                        <SkipPreviousRounded />
                      </IconButton>
                      <span className="Large">
                        <IconButton onClick={() => this.emit(isPlaying ? 'pause' : 'play')}>
                          {isPlaying ? <PauseRounded /> : <PlayArrowRounded />}
                        </IconButton>
                      </span>
                      <IconButton onClick={() => this.emit('next_track')}>
                        <SkipNextRounded />
                      </IconButton>
                      <IconButton onClick={() => this.emit('play', { context_uri: process.env.REACT_APP_SPO_LIKES_URI })}>
                        <FavoriteRounded />
                      </IconButton>
                    </div>
                    <div className="Volume">
                      <Slider valueLabelDisplay="auto"
                        value={this.state.volume}
                        onChange={(e, v) => this.setVolume(v)}
                        onChangeCommitted={(e, v) => this.emit('set_volume', v)} />
                    </div>
                  </div>
                ) : <div className="Container">{this.state.error}</div>
              ) : <div className="Controls Large">
                  <IconButton onClick={() => { this.login().then(this.setupConnect) }}>
                    <LockRounded />
                  </IconButton>
                </div>
              }
            </div>
          </main>
        </div >
      </ThemeProvider>
    )
  }
}
export default App
