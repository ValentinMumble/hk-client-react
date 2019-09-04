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
  }
  componentDidUpdate(prevProps) {
    if (this.props.src !== prevProps.src) this.loadArtwork(this.props.src)
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
      <div className="Artwork">
        <img ref={this.img} src={this.state.current} alt="" />
        <img className={this.state.hidden} src={this.state.prev} alt="" />
        {/* <div TODO
    style={{ transform: `rotate(${-180 + this.state.progressPercent * 180 / 100}deg)` }}
    className="Progress"
  ></div> */}
      </div>
    )
  }
}
export default Artwork
