import React, { Component } from 'react'
import './Artwork.css'
import { I, fetchImage } from './util'
import FastAverageColor from 'fast-average-color'

class Artwork extends Component {
  constructor(props) {
    super(props)
    this.state = {
      prev: I.BLACK
    }
    this.img = React.createRef()
    this.fac = new FastAverageColor()
  }
  componentDidMount() {
    this.loadArtwork(this.props.src)
    this.setState({progress: this.props.progress})
    this.progressTimer = window.setInterval(() => {
      if (this.props.isPlaying) {
        this.setState({ progress: this.state.progress + 1000 })
      }
    }, 1000)
  }
  componentDidUpdate(prevProps) {
    if (this.props.src !== prevProps.src) this.loadArtwork(this.props.src)
    if (this.props.progress !== prevProps.progress) this.setState({progress: this.props.progress})
    if (this.props.trackDuration !== prevProps.trackDuration) this.setState({progress: 0})
  }
  loadArtwork = url => {
    if (url) {
      fetchImage(url, this.onArtworkData)
    } else {
      this.onArtworkData(I.GRAY)
    }
  }
  onArtworkData = data => {
    this.setState({ current: data, hidden: 'hidden' })
    this.fac.getColorAsync(this.img.current).then(color => this.props.onColorChange(color.hex))
    setTimeout(() => this.setState({ prev: data, hidden: '' }), 600)
  }
  render() {
    return (
      <div className={`Artwork ${this.props.isPlaying ? '' : 'paused'}`} onClick={this.props.onClick}>
        <img ref={this.img} src={this.state.current} alt="" />
        <img className={this.state.hidden} src={this.state.prev} alt="" />
        <div className="Progress" style={{ transform: `rotate(${-180 + this.state.progress / this.props.trackDuration * 180}deg)` }}></div>
      </div>
    )
  }
}
export default Artwork
