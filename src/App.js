import React, { Component } from 'react'
import './App.css'
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css"
import Loader from 'react-loader-spinner'
import { checkToken, refreshToken, getToken, login, post } from './auth'
import openSocket from 'socket.io-client'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpotify, faBluetoothB } from '@fortawesome/free-brands-svg-icons'
import {
  faStepBackward,
  faStepForward,
  faPlay,
  faPause,
  faMagic,
  faHeart,
  faVolumeDown,
  faVolumeUp,
  faMusic,
  faBroadcastTower,
  faLightbulb,
  faPowerOff,
  faCompactDisc
} from '@fortawesome/free-solid-svg-icons'

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
    login()
      .then(() => this.setState({ authorised: true }))
      .then(this.setupConnect)
  }
  setProgress = (progress, timestamp) => {
    const trackLength = this.state.activeTrack.duration_ms
    this.setState({
      progress: progress,
      progressPercent: progress / trackLength * 100
    })
  }
  setPlaybackState = isPlaying => {
    this.setState({
      isPlaying
    })
  }
  setDevice = device => {
    this.setState({
      device
    })
  }
  setVolume = volume => {
    this.setState({
      volume
    })
  }
  setTrack = activeTrack => {
    this.setState({
      activeTrack
    })
  }
  emit = (event, value) => {
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
    console.log(error.name)
    if (error.name === 'NoActiveDeviceError') {//TODO
      this.emit('transfer_playback', { id: process.env.REACT_APP_PI_ID })
    } else {
      this.setState({ error: error.message || error })
    }
  }
  setupConnect = () => {
    const io = openSocket(process.env.REACT_APP_SOCKET_URL)
    const wrappedHandler = (event, handler) => {
      io.on(event, data => {
        console.info(event, data)
        handler(data)
      })
    }
    io.emit('initiate', { accessToken: getToken() })
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

    window.setInterval(() => {
      refreshToken((accessToken) => {
        this.emit('access_token', accessToken)
      })
    }, 55 * 60 * 1000) // 55 minutes
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
            <div className="Controls Colors">
              <div
                onClick={() => post(process.env.REACT_APP_HUE_API, { state: true, 'color': '#ffffff' })}></div>
              <div
                onClick={() => post(process.env.REACT_APP_HUE_API, { state: true, 'color': '#ffaa71' })}></div>
              <FontAwesomeIcon
                onClick={() => post(process.env.REACT_APP_HUE_API, { state: false })}
                size="xs"
                icon={faLightbulb}
              />
              <div
                onClick={() => post(process.env.REACT_APP_HUE_API, { state: true, 'color': '#01A7C2' })}></div>
              <div
                onClick={() => post(process.env.REACT_APP_HUE_API, { state: true, 'color': '#FF96CA' })}></div>
            </div>
            <div className="Controls">
              <FontAwesomeIcon
                onClick={() => post(process.env.REACT_APP_HK_API, { func: 'selectSource', param: 'Radio' })}
                size="xs"
                icon={faBroadcastTower}
              />
              <FontAwesomeIcon
                onClick={() => post(process.env.REACT_APP_HK_API, { func: 'selectSource', param: 'TV' })}
                size="xs"
                icon={faMusic}
              />
              <FontAwesomeIcon
                onClick={() => post(process.env.REACT_APP_S_API)}
                size="xs"
                icon={faBluetoothB}
              />
              <FontAwesomeIcon
                onClick={() => post(process.env.REACT_APP_HK_API, { func: 'off' })}
                size="xs"
                icon={faPowerOff}
              />
            </div>
            <div className="Controls">
              <FontAwesomeIcon
                onClick={() => post(process.env.REACT_APP_HK_API, { func: 'volumeDown' })}
                size="lg"
                icon={faVolumeDown}
              />
              <FontAwesomeIcon
                onClick={() => post(process.env.REACT_APP_HK_API, { func: 'volumeUp' })}
                size="lg"
                icon={faVolumeUp}
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
                        <FontAwesomeIcon
                          icon={faCompactDisc}
                          size="8x"
                        />
                      )}
                    <div
                      style={{ width: `${100 - this.state.progressPercent}%` }}
                      className="Progress"
                    ></div>
                  </div>
                  <h4 className="Title">
                    {activeTrack.name}<br /><span className="Dark">by</span> {activeTrack.artists[0].name}
                  </h4>
                  <div className="Controls">
                    <FontAwesomeIcon
                      onClick={() => this.emit('play', { context_uri: process.env.REACT_APP_DISCOVER_WEEKLY })}
                      size="xs"
                      icon={faMagic}
                    />
                    <FontAwesomeIcon
                      onClick={() => this.emit('previous_track')}
                      icon={faStepBackward}
                    />
                    <FontAwesomeIcon
                      onClick={() => this.emit(isPlaying ? 'pause' : 'play')}
                      size="lg"
                      icon={isPlaying ? faPause : faPlay}
                    />
                    <FontAwesomeIcon
                      onClick={() => this.emit('next_track')}
                      icon={faStepForward}
                    />
                    <FontAwesomeIcon
                      onClick={() => this.emit('play', { context_uri: process.env.REACT_APP_LIKES })}
                      size="xs"
                      icon={faHeart}
                    />
                  </div>
                  <div className="Volume">
                    <input
                      type="range" min="0" max="100" value={volume}
                      onChange={(e) => this.emit('set_volume', e.target.value)}
                    />
                  </div>
                </div>
              ) : error ? (
                <div className="Container">{error}</div>
              ) : (
                    <div>
                      <Loader type="ThreeDots" color="#222" />
                    </div>
                  )
            ) : (
                <div className="Authorise">
                  <FontAwesomeIcon
                    onClick={this.authorise}
                    size="lg"
                    icon={faSpotify}
                  />
                </div>
              )}</div>
        </main>
      </div>
    )
  }
}

export default App
