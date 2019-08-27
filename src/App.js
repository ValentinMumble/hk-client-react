import React, { Component } from 'react'
import './App.css'
import { checkToken, refreshToken, getAccessToken, login, logout, api } from './auth'
import openSocket from 'socket.io-client'
import { Slider, CircularProgress } from '@material-ui/core'
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
  LockRounded
} from '@material-ui/icons'

class App extends Component {
  state = {
    authorised: checkToken(),
  }
  componentDidMount() {
    if (checkToken()) {
      this.setupConnect()
    }
  }
  authorise = () => {
    api(process.env.REACT_APP_SERVER_URL + '/authorise-url').then(data => {
      login(data.url)
        .then(() => this.setState({ authorised: true }))
        .then(this.setupConnect)
    })
  }
  setProgress = (progress, timestamp) => {
    const trackLength = this.state.activeTrack.duration_ms
    this.setState({
      progress: progress,
      progressPercent: progress / trackLength * 100
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
  }
  emit = (event, value) => {
    console.info('Emit', event, value)
    this.io.emit(event, value)

    // optimistic updates
    switch (event) {
      case 'play':
        this.setPlaybackState(true)
        break
      case 'pause':
        this.setPlaybackState(false)
        break
      case 'set_volume':
        this.setVolume(value)
        break
      default:
        break
    }
  }
  onError = error => {
    if (error.name === 'NoAccessToken') {
      this.emit('initiate', { accessToken: getAccessToken() })
    } else if (error.name === 'NoActiveDeviceError') {
      this.emit('transfer_playback', { id: process.env.REACT_APP_PI_ID })
    } else if (error === 'The access token expired') {
      this.refreshToken()
    } else if (error === 'Invalid access token') {
      logout()
    } else {
      this.setState({ error: error.message || error })
    }
  }
  refreshToken = () => {
    refreshToken((accessToken) => {
      this.emit('access_token', accessToken)
    })
  }
  setupConnect = () => {
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
    this.emit('initiate', { accessToken: getAccessToken() })

    window.setInterval(this.refreshToken, 55 * 60 * 1000) // 55 minutes
  }
  render() {
    const {
      error,
      activeTrack,
      authorised,
      playerReady,
      isPlaying,
      volume
    } = this.state
    return (
      <div className="App">
        <main>
          <div className="Container">
            <div className="Colors Controls">
              <div
                onClick={() => api(process.env.REACT_APP_HUE_API, { data: { state: false }, method: 'POST' })}></div>
              <div
                onClick={() => api(process.env.REACT_APP_HUE_API, { data: { state: true, 'color': '#ffffff' }, method: 'POST' })}></div>
              <div
                onClick={() => api(process.env.REACT_APP_HUE_API, { data: { state: true, 'color': '#ffaa71' }, method: 'POST' })}></div>
              <div
                onClick={() => api(process.env.REACT_APP_HUE_API, { data: { state: true, 'color': '#01A7C2' }, method: 'POST' })}></div>
              <div
                onClick={() => api(process.env.REACT_APP_HUE_API, { data: { state: true, 'color': '#FF96CA' }, method: 'POST' })}></div>
            </div>
            <div className="Controls">
              <RadioRounded
                onClick={() => api(process.env.REACT_APP_HK_API, { data: { func: 'selectSource', param: 'Radio' }, method: 'POST' })}
              />
              <MusicNoteRounded
                onClick={() => api(process.env.REACT_APP_HK_API, { data: { func: 'selectSource', param: 'TV' }, method: 'POST' })}
              />
              <BluetoothRounded
                onClick={() => api(process.env.REACT_APP_S_API, { method: 'POST' })}
              />
              <PowerSettingsNewRounded
                onClick={() => api(process.env.REACT_APP_HK_API, { data: { func: 'off' }, method: 'POST' })}
              />
            </div>
            <div className="Controls Large">
              <VolumeDownRounded
                onClick={() => api(process.env.REACT_APP_HK_API, { data: { func: 'volumeDown' }, method: 'POST' })}
              />
              <VolumeUpRounded
                onClick={() => api(process.env.REACT_APP_HK_API, { data: { func: 'volumeUp' }, method: 'POST' })}
              />
            </div>
            {authorised ? (
              playerReady ? (
                <div className="Container">
                  <div className="Artwork">
                    {activeTrack.album.images.length > 0 ? (
                      <img src={activeTrack.album.images[0].url}
                        alt={`${activeTrack.name} - ${activeTrack.artists[0].name}`}
                      />) : (
                        <AlbumRounded />
                      )}
                    <div
                      style={{ transform: `rotate(${-180 + this.state.progressPercent * 180 / 100}deg)` }}
                      className="Progress"
                    ></div>
                  </div>
                  <h4 className="Title">
                    {activeTrack.name}<br /><span className="Dark">{activeTrack.artists[0].name}</span>
                  </h4>
                  <div className="Controls">
                    <NewReleasesRounded
                      onClick={() => this.emit('play', { context_uri: process.env.REACT_APP_DISCOVER_WEEKLY })}
                    />
                    <SkipPreviousRounded
                      onClick={() => this.emit('previous_track')}
                    />
                    <span className="Large">
                      {isPlaying ? (
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
                      onClick={() => this.emit('play', { context_uri: process.env.REACT_APP_LIKES })}
                    />
                  </div>
                  <div className="Volume">
                    <Slider
                      value={volume}
                      valueLabelDisplay="auto"
                      min={0}
                      max={100}
                      onChange={(e, v) => this.setVolume(v)}
                      onChangeCommitted={(e, v) => this.emit('set_volume', v)}
                    />
                  </div>
                </div>
              ) : error ? (
                <div className="Container">{error}</div>
              ) : (
                    <CircularProgress color="inherit" size="5rem" />
                  )
            ) : (
                <div className="Controls Large">
                  <LockRounded onClick={this.authorise} />
                </div>
              )}</div>
        </main>
      </div>
    )
  }
}

export default App
