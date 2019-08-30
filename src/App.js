import React, { Component } from 'react'
import './App.css'
import { withPrimary } from './theme'
import { api, fetchImage } from './util'
import openSocket from 'socket.io-client'
import FastAverageColor from 'fast-average-color'
import { Snackbar, Slider, CircularProgress, IconButton, Typography } from '@material-ui/core'
import { ThemeProvider } from '@material-ui/styles';
import {
  RadioRounded,
  AlbumRounded,
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
      //pickerVisible: false,
      snackbar: { opened: false },
      theme: withPrimary('#000')
    }
    this.fac = new FastAverageColor()
  }
  componentDidMount() {
    api(process.env.REACT_APP_SERVER_URL + '/spotify/access-token').then(data => {
      if (data.url) {
        this.setState({ authorized: false, authorizeUrl: data.url })
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
  setPlaybackState = isPlaying => {
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
      fetchImage(activeTrack.album.images[0].url, this.onArtwork)
    } else {
      this.setState({ theme: withPrimary('#777') })
    }
  }
  emit = (event, value) => {
    console.info('Emit', event, value)
    this.io.emit(event, value)

    // optimistic updates
    switch (event) {
      case 'play': this.setPlaybackState(true)
        break
      case 'pause': this.setPlaybackState(false)
        break
      default:
        break
    }
  }
  onError = error => {
    if (error.name === 'NoAccessToken') {
      this.emit('initiate', { accessToken: this.state.accessToken })
    } else if (error.name === 'NoActiveDeviceError') {
      this.emit('transfer_playback', { id: process.env.REACT_APP_PI_ID })
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
        if (popup) {
          popup.postMessage('login', window.location)
        }
      }, 1000)
      window.onmessage = event => {
        clearInterval(listener)
        window.onmessage = null
        return resolve(JSON.parse(event.data))
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
      this.setPlaybackState(state.is_playing)
      this.setTrack(state.item)
      this.setProgress(state.progress_ms)
      this.setState({ playerReady: true })
      this.progressTimer = window.setInterval(() => {
        if (this.state.isPlaying) {
          this.setProgress(this.state.progress + 1000)
        }
      }, 1000)
    })
    wrappedHandler('track_change', this.setTrack)
    wrappedHandler('seek', this.setProgress)
    wrappedHandler('playback_started', () => this.setPlaybackState(true))
    wrappedHandler('playback_paused', () => this.setPlaybackState(false))
    wrappedHandler('device_change', this.setDevice)
    wrappedHandler('volume_change', this.setVolume)
    wrappedHandler('track_end', () => { })
    wrappedHandler('connect_error', this.onError)

    this.io = io
    this.emit('initiate', { accessToken: this.state.accessToken })

    window.setInterval(this.refreshToken, 55 * 60 * 1000) // 55 minutes
  }
  snack = (message, duration = 3000) => {
    if (message) this.setState({ snackbar: { opened: true, message, duration } })
  }
  onApi = json => {
    this.snack(json.error || json.message)
  }
  onArtwork = data => { //TODO improve this setTimeout bullshit
    let artwork = document.querySelector('#artwork')
    artwork.src = data
    setTimeout(() => this.setState({ theme: withPrimary(this.fac.getColor(artwork).hex) }), 10)
  }
  render() {
    const {
      activeTrack,
      pickerVisible,
      snackbar
    } = this.state
    return (
      <ThemeProvider theme={this.state.theme}>
        <div className="App">
          <main>
            <Snackbar
              anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
              open={snackbar.opened}
              autoHideDuration={snackbar.duration}
              onClose={() => this.setState({ snackbar: { ...snackbar, opened: false } })}
              message={snackbar.message}
            />
            {this.state.loaded && (this.state.playerReady || this.state.error) ? (
              <div className="Container">
                <div className="Container Top">
                  <div className="Small">
                    <IconButton onClick={() => api(process.env.REACT_APP_HK_API, { data: { func: 'selectSource', param: 'Radio' }, method: 'POST' }).then(this.onApi)}>
                      <RadioRounded />
                    </IconButton>
                    <IconButton onClick={() => api(process.env.REACT_APP_HK_API, { data: { func: 'selectSource', param: 'TV' }, method: 'POST' }).then(this.onApi)}>
                      <MusicNoteRounded />
                    </IconButton>
                    <IconButton onClick={() => this.setState({ pickerVisible: !pickerVisible })}>
                      <WbIncandescentRounded />
                    </IconButton>
                    <IconButton onClick={() => api(process.env.REACT_APP_SERVER_URL + '/bluetooth/reset').then(this.onApi)}>
                      <BluetoothRounded />
                    </IconButton>
                    <IconButton onClick={() => api(process.env.REACT_APP_HK_API, { data: { func: 'off' }, method: 'POST' }).then(this.onApi)}>
                      <PowerSettingsNewRounded />
                    </IconButton>
                  </div>
                  {pickerVisible && (
                    <div className="Colors">
                      <div
                        onClick={() => api(process.env.REACT_APP_SERVER_URL + '/hue/off').then(this.onApi)}></div>
                      <div
                        onClick={() => api(process.env.REACT_APP_SERVER_URL + '/hue/on/ffffff').then(this.onApi)}></div>
                      <div
                        onClick={() => api(process.env.REACT_APP_SERVER_URL + '/hue/on/ffaa71').then(this.onApi)}></div>
                      <div
                        onClick={() => api(process.env.REACT_APP_SERVER_URL + '/hue/on/01A7C2').then(this.onApi)}></div>
                      <div
                        onClick={() => api(process.env.REACT_APP_SERVER_URL + '/hue/on/FF96CA').then(this.onApi)}></div>
                    </div>)}
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
                  this.state.playerReady ? (
                    <div className="Container">
                      <div className="Artwork" onClick={() => this.snack('Coucu', 1000)}>
                        {activeTrack.album.images.length > 0 ? (
                          <img id="artwork" src={activeTrack.album.images[0].url} alt={`${activeTrack.name} - ${activeTrack.artists[0].name}`} />
                        ) : (
                            <AlbumRounded />
                          )}
                        <div
                          style={{ transform: `rotate(${-180 + this.state.progressPercent * 180 / 100}deg)` }}
                          className="Progress"
                        ></div>
                      </div>
                      <Typography className="Title" variant="h5" color="primary"
                        onClick={() => api(`${process.env.REACT_APP_SERVER_URL}/spotify/addok/${activeTrack.uri}`).then(json => {
                          if (json.data.body.snapshot_id) json.message = activeTrack.name + ' added to playlist OK!'
                          this.onApi(json)
                        })}
                      >
                        {activeTrack.name}<br /><span className="Dark">{activeTrack.artists[0].name}</span>
                      </Typography>
                      <div>
                        <IconButton onClick={() => this.emit('play', { context_uri: process.env.REACT_APP_SPO_DISCOVER_WEEKLY_URI })}>
                          <NewReleasesRounded />
                        </IconButton>
                        <IconButton
                          onClick={() => this.emit('previous_track')}>
                          <SkipPreviousRounded />
                        </IconButton>
                        <span >
                          <IconButton className="Large" onClick={() => this.emit(this.state.isPlaying ? 'pause' : 'play')}>
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
