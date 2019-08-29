import React, { Component } from 'react'
import './App.css'
import openSocket from 'socket.io-client'
import qs from 'query-string'
import FastAverageColor from 'fast-average-color'
import { Snackbar, Slider, CircularProgress, createMuiTheme } from '@material-ui/core'
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

export const api = async (uri, { data = {}, method = 'GET' } = {}) => {
  const response = await fetch(uri, {
    method,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded' //Fucking CORS
    },
    body: Object.entries(data).length === 0 ? null : qs.stringify(data)
  })
  const json = await response.json()
  console.log('api', json)
  return json
}

const fetchImage = (url, callback) => {
  let downloadedImg = new Image()
  downloadedImg.crossOrigin = 'Anonymous'
  downloadedImg.src = url
  downloadedImg.addEventListener('load', () => {
    let canvas = document.createElement('canvas')
    let context = canvas.getContext('2d')
    canvas.width = downloadedImg.width
    canvas.height = downloadedImg.height
    context.drawImage(downloadedImg, 0, 0)
    callback(canvas.toDataURL('image/png'))
  })
}

const withPrimary = color => {
  return createMuiTheme({
    palette: {
      primary: { main: color }
    },
    props: {
      MuiSvgIcon: { color: 'primary' }
    }
  })
}

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      authorized: true,
      //pickerVisible: false,
      snackbar: { opened: false, message: '' },
      theme: withPrimary('#777')
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
    if (activeTrack.album.images.length > 0) fetchImage(activeTrack.album.images[0].url, this.onArtwork)
    this.setState({ activeTrack })
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
  snack = message => {
    if (message) this.setState({ snackbar: { opened: true, message } })
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
              autoHideDuration={3000}
              onClose={() => this.setState({ snackbar: { ...snackbar, opened: false } })}
              message={snackbar.message}
            />
            <div className="Container">
              <div className="Controls Small">
                <RadioRounded
                  onClick={() => api(process.env.REACT_APP_HK_API, { data: { func: 'selectSource', param: 'Radio' }, method: 'POST' }).then(this.onApi)}
                />
                <MusicNoteRounded
                  onClick={() => api(process.env.REACT_APP_HK_API, { data: { func: 'selectSource', param: 'TV' }, method: 'POST' }).then(this.onApi)}
                />
                <WbIncandescentRounded
                  onClick={() => this.setState({ pickerVisible: !pickerVisible })}
                />
                <BluetoothRounded
                  onClick={() => api(process.env.REACT_APP_SERVER_URL + '/bluetooth/reset').then(this.onApi)}
                />
                <PowerSettingsNewRounded
                  onClick={() => api(process.env.REACT_APP_HK_API, { data: { func: 'off' }, method: 'POST' }).then(this.onApi)}
                />
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
              <div className="Controls Large">
                <VolumeDownRounded
                  onClick={() => api(process.env.REACT_APP_HK_API, { data: { func: 'volumeDown' }, method: 'POST' }).then(this.onApi)}
                />
                <VolumeUpRounded
                  onClick={() => api(process.env.REACT_APP_HK_API, { data: { func: 'volumeUp' }, method: 'POST' }).then(this.onApi)}
                />
              </div>
              {this.state.authorized ? (
                this.state.playerReady ? (
                  <div className="Container">
                    <div className="Artwork">
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
                    <h4 className="Title"
                      onClick={() => api(`${process.env.REACT_APP_SERVER_URL}/spotify/addok/${activeTrack.uri}`).then(json => {
                        if (json.data.body.snapshot_id) json.message = activeTrack.name + ' added to playlist OK!'
                        this.onApi(json)
                      })}
                    >
                      {activeTrack.name}<br /><span className="Dark">{activeTrack.artists[0].name}</span>
                    </h4>
                    <div className="Controls">
                      <NewReleasesRounded
                        onClick={() => this.emit('play', { context_uri: process.env.REACT_APP_SPO_DISCOVER_WEEKLY_URI })}
                      />
                      <SkipPreviousRounded
                        onClick={() => this.emit('previous_track')}
                      />
                      <span className="Large">
                        {this.state.isPlaying ? (
                          <PauseRounded
                            onClick={() => this.emit('pause')}
                          />
                        ) : (
                            <PlayArrowRounded
                              onClick={() => this.emit('play')}
                            />
                          )}
                      </span>
                      <SkipNextRounded
                        onClick={() => this.emit('next_track')}
                      />
                      <FavoriteRounded
                        onClick={() => this.emit('play', { context_uri: process.env.REACT_APP_SPO_LIKES_URI })}
                      />
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
                ) : this.state.error ? (
                  <div className="Container">{this.state.error}</div>
                ) : (
                      <CircularProgress color="inherit" size="5rem" />
                    )
              ) : (
                  <div className="Controls Large">
                    <LockRounded onClick={() => { this.login().then(this.setupConnect) }} />
                  </div>
                )}</div>
          </main>
        </div >
      </ThemeProvider>
    )
  }
}

export default App
