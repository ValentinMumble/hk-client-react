import React, { Component } from 'react'
import './App.css'
import { withPrimary } from './theme'
import { api, fetchImage, I } from './util'
import openSocket from 'socket.io-client'
import FastAverageColor from 'fast-average-color'
import { Snackbar, Slider, CircularProgress, IconButton, Typography, SnackbarContent, Popover } from '@material-ui/core'
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
  WbIncandescentRounded
} from '@material-ui/icons'

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      snackbar: { opened: false },
      popover: { opened: false },
      theme: withPrimary('#000'),
      artwork: { prev: I.BLACK, current: '' }
    }
    this.artwork = React.createRef()
    this.fac = new FastAverageColor()
    this.colors = ['transparent', '#ffffff', '#ffaa71', '#01A7C2', '#FF96CA']
  }
  componentDidMount() {
    api(process.env.REACT_APP_SERVER_URL + '/spotify/access-token').then(data => {
      if (data.url) {
        this.setState({ authorized: false, authorizeUrl: data.url, theme: withPrimary('#777') })
      } else {
        this.setupConnect(data.accessToken)
      }
      this.setState({ loaded: true })
    })
  }
  setProgress = (progress, timestamp) => {
    this.setState({
      progress: progress,
      progressPercent: progress / this.state.activeTrack.duration_ms * 100
    })
  }
  setPlayback = isPlaying => {
    this.setState({ isPlaying })
  }
  setDevice = device => {
    this.setState({ device })
  }
  setVolume = volume => {
    this.setState({ volume })
  }
  setTrack = activeTrack => {
    this.setState({ activeTrack })
    if (activeTrack.album.images.length > 0) {
      fetchImage(activeTrack.album.images[0].url, this.onArtworkData)
    } else {
      this.onArtworkData(I.GRAY)
    }
  }
  emit = (event, value) => {
    console.info('Emit', event, value)
    this.io.emit(event, value)

    // optimistic updates
    switch (event) {
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
      this.emit('initiate', { accessToken: this.state.accessToken })
    } else if (error.name === 'NoActiveDeviceError') {
      this.emit('transfer_playback', { id: process.env.REACT_APP_SPO_PI_ID })
    } else if (error === 'The access token expired') {
      this.refreshToken()
    } else {
      this.setState({ error: error.message || error })
    }
  }
  refreshToken = () => {
    console.info('Refreshing token...')
    api(process.env.REACT_APP_SERVER_URL + '/spotify/refresh-token').then(data => {
      this.setState({ accessToken: data.accessToken })
      this.emit('access_token', data.accessToken)
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
    this.setState({ accessToken, authorized: true })
    const io = openSocket(process.env.REACT_APP_SERVER_URL + '/connect')
    const wrappedHandler = (event, handler) => {
      io.on(event, data => {
        console.info(event, data)
        handler(data)
      })
    }
    wrappedHandler('initial_state', state => {
      this.setVolume(state.device.volume_percent)
      this.setDevice(state.device)
      this.setPlayback(state.is_playing)
      this.setTrack(state.item)
      this.setProgress(state.progress_ms)
      // this.progressTimer = window.setInterval(() => { // TODO
      //   if (this.state.isPlaying) {
      //     this.setProgress(this.state.progress + 1000)
      //   }
      // }, 1000)
    })
    wrappedHandler('track_change', this.setTrack)
    wrappedHandler('seek', this.setProgress)
    wrappedHandler('playback_started', () => this.setPlayback(true))
    wrappedHandler('playback_paused', () => this.setPlayback(false))
    wrappedHandler('device_change', this.setDevice)
    wrappedHandler('volume_change', this.setVolume)
    wrappedHandler('track_end', () => { })
    wrappedHandler('connect_error', this.onError)

    this.io = io
    this.emit('initiate', { accessToken: this.state.accessToken })
  }
  snack = (message, duration = 2000, color = this.state.theme.palette.primary.main) => {
    if (message) this.setState({ snackbar: { ...this.state.snackbar, opened: true, message, duration, color } })
  }
  onApi = json => {
    this.snack(json.message || json.error)
  }
  onArtworkData = data => {
    this.setState({ artwork: { ...this.state.artwork, current: data, class: 'hidden' } })
    this.fac.getColorAsync(this.artwork.current).then(color => this.setState({ theme: withPrimary(color.hex) }))
    setTimeout(() => this.setState({ artwork: { ...this.state.artwork, prev: data, class: '' } }), 600)
  }
  onColorClick = color => {
    if (color === 'transparent') {
      this.setState({ popover: { ...this.state.popover, opened: false } })
      api(process.env.REACT_APP_SERVER_URL + '/hue/off').then(this.onApi)
    } else {
      api(process.env.REACT_APP_SERVER_URL + '/hue/on/' + color.substring(1)).then(this.onApi)
    }
  }
  render() {
    const {
      activeTrack,
      snackbar,
      popover,
      artwork
    } = this.state,
      colors = Array.from(this.colors)
    colors.push(this.state.theme.palette.primary.main)
    return (
      <ThemeProvider theme={this.state.theme}>
        <div className="App">
          <main>
            <Snackbar
              anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
              autoHideDuration={snackbar.duration}
              open={snackbar.opened}
              onClose={() => this.setState({ snackbar: { ...snackbar, opened: false } })}>
              <SnackbarContent
                style={{ backgroundColor: snackbar.color }}
                message={snackbar.message} />
            </Snackbar>
            <Popover
              anchorOrigin={{ vertical: 'bottom', horizontal: 'center', }}
              transformOrigin={{ vertical: 'top', horizontal: 'center', }}
              anchorEl={popover.anchorEl}
              open={popover.opened}
              onClose={() => this.setState({ popover: { ...popover, opened: false } })}>
              <div className="Colors">
                {colors.map((color, i) => <div key={i} style={{ backgroundColor: color }} onClick={() => this.onColorClick(color)}></div>)}
              </div>
            </Popover>
            {this.state.loaded && (!this.state.authorized || this.state.activeTrack || this.state.error) ? (
              <div className="Container">
                <div className="Container Top">
                  <div className="Small">
                    <IconButton onClick={() => api(process.env.REACT_APP_HK_API, { data: { func: 'selectSource', param: 'Radio' }, method: 'POST' }).then(this.onApi)}>
                      <RadioRounded />
                    </IconButton>
                    <IconButton onClick={() => api(process.env.REACT_APP_HK_API, { data: { func: 'selectSource', param: 'TV' }, method: 'POST' }).then(this.onApi)}>
                      <MusicNoteRounded />
                    </IconButton>
                    <IconButton onClick={(e) => this.setState({ popover: { ...popover, opened: !this.state.popover.opened, anchorEl: e.currentTarget } })}>
                      <WbIncandescentRounded />
                    </IconButton>
                    <IconButton onClick={() => api(process.env.REACT_APP_SERVER_URL + '/bluetooth/reset').then(this.onApi)}>
                      <BluetoothRounded />
                    </IconButton>
                    <IconButton onClick={() => api(process.env.REACT_APP_HK_API, { data: { func: 'off' }, method: 'POST' }).then(this.onApi)}>
                      <PowerSettingsNewRounded />
                    </IconButton>
                  </div>
                  <div className="Large">
                    <IconButton onClick={() => api(process.env.REACT_APP_HK_API, { data: { func: 'volumeDown' }, method: 'POST' }).then(this.onApi)}>
                      <VolumeDownRounded />
                    </IconButton>
                    <IconButton onClick={() => api(process.env.REACT_APP_HK_API, { data: { func: 'volumeUp' }, method: 'POST' }).then(this.onApi)}>
                      <VolumeUpRounded />
                    </IconButton>
                  </div>
                </div>
                {this.state.authorized ? (
                  this.state.activeTrack ? (
                    <div className="Container">
                      <div className="Artwork" onClick={() => this.snack('TODO', 1000)}>
                        <img ref={this.artwork} id="artwork" src={artwork.current} alt="" />
                        <img className={artwork.class} src={artwork.prev} alt="" />
                        {/* <div TODO
                          style={{ transform: `rotate(${-180 + this.state.progressPercent * 180 / 100}deg)` }}
                          className="Progress"
                        ></div> */}
                      </div>
                      <Typography className="Title" variant="h5" color="primary"
                        onClick={() => api(`${process.env.REACT_APP_SERVER_URL}/spotify/addok/${activeTrack.uri}`).then(this.onApi)}>
                        {activeTrack.name}<br /><span className="Dark">{activeTrack.artists[0].name}</span>
                      </Typography>
                      <div className="Controls Small">
                        <IconButton onClick={() => this.emit('play', { context_uri: process.env.REACT_APP_SPO_DISCOVER_WEEKLY_URI })}>
                          <NewReleasesRounded />
                        </IconButton>
                        <IconButton
                          onClick={() => this.emit('previous_track')}>
                          <SkipPreviousRounded />
                        </IconButton>
                        <span className="Large">
                          <IconButton onClick={() => this.emit(this.state.isPlaying ? 'pause' : 'play')}>
                            {this.state.isPlaying ? (
                              <PauseRounded />
                            ) : (
                                <PlayArrowRounded />
                              )}
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
                        <Slider
                          value={this.state.volume}
                          valueLabelDisplay="auto"
                          min={0}
                          max={100}
                          onChange={(e, v) => this.setVolume(v)}
                          onChangeCommitted={(e, v) => this.emit('set_volume', v)}
                        />
                      </div>
                    </div>
                  ) : (
                      <div className="Container">{this.state.error}</div>
                    )
                ) : (
                    <div className="Controls Large">
                      <IconButton onClick={() => { this.login().then(this.setupConnect) }}>
                        <LockRounded />
                      </IconButton>
                    </div>
                  )}
              </div>) : (<CircularProgress color="inherit" size="5rem" />)}
          </main>
        </div >
      </ThemeProvider>
    )
  }
}

export default App
