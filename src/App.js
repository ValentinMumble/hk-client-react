import React, { Component } from 'react'
import './App.css'
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css"
import Loader from 'react-loader-spinner'
import { checkToken, getToken, login } from './auth'
import openSocket from 'socket.io-client'
import Icon from '@fortawesome/react-fontawesome'
import {
  faStepBackward,
  faStepForward,
  faPlay,
  faPause
} from '@fortawesome/fontawesome-free-solid'

class App extends Component {
  state = {
    authorised: checkToken(),
    eventLog: []
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
      default:
        break
    }
  }
  onError = error => {
    if (error.name === 'NoActiveDeviceError') {
      this.io.emit('transfer_playback', {id: process.env.REACT_APP_PI_ID})
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
  }
  render() {
    const {
      error,
      activeTrack,
      authorised,
      playerReady,
      isPlaying
    } = this.state
    return (
      <div className="App">
        <main>
          {authorised ? (
            playerReady ? (
              <div className="Container">
                <img
                  className="Artwork"
                  src={activeTrack.album.images[0].url}
                  alt={`${activeTrack.name} - ${activeTrack.artists[0].name}`}
                />
                <h4 className="Title">
                  {activeTrack.name} - {activeTrack.artists[0].name}
                </h4>
                <div className="Controls">
                  <Icon
                    onClick={() => this.emit('previous_track')}
                    icon={faStepBackward}
                  />
                  <Icon
                    onClick={() => this.emit(isPlaying ? 'pause' : 'play')}
                    size="lg"
                    icon={isPlaying ? faPause : faPlay}
                  />
                  <Icon
                    onClick={() => this.emit('next_track')}
                    icon={faStepForward}
                  />
                </div>
                <div className="ProgressBar">
                  <div
                    style={{ width: `${this.state.progressPercent}%` }}
                    className="Progress"
                  >
                    <span />
                  </div>
                </div>
              </div>
            ) : error ? (
              <div className="Container">{error}</div>
            ) : (
                  <div className="Container">
                    <Loader type="ThreeDots" color="#222"/>
                  </div>
                )
          ) : (
              <div className="Container">
                <button onClick={this.authorise}>Login with Spotify</button>
              </div>
            )}
        </main>
      </div>
    )
  }
}

export default App
