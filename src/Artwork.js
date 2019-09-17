import React, { Component } from 'react';
import './Artwork.css';
import { I, fetchImage } from './util';
import splashy from 'splashy';

class Artwork extends Component {
  constructor(props) {
    super(props);
    this.state = {
      prev: I.BLACK,
      progress: props.progress
    };
    this.img = React.createRef();
  }
  componentDidMount() {
    this.loadArtwork(this.props.src);
    this.progressTimer = window.setInterval(() => {
      if (this.props.isPlaying) this.setState({ progress: this.state.progress + 200 });
    }, 200);
  }
  componentDidUpdate(prevProps) {
    if (this.props.src !== prevProps.src) this.loadArtwork(this.props.src);
    if (this.props.trackDuration !== prevProps.trackDuration) this.setState({ progress: 0 });
    if (this.props.progress !== prevProps.progress) this.setState({ progress: this.props.progress });
  }
  loadArtwork = url => {
    if (url) {
      fetchImage(url, this.onArtworkData);
    } else {
      this.onArtworkData(I.GRAY);
    }
  };
  onArtworkData = async (data, image) => {
    // TODO clean this & fix bug when no artwork
    this.setState({ current: data, hidden: 'Hidden' });
    this.props.onColorChange(await splashy(this.img.current));
    setTimeout(() => this.setState({ prev: data, hidden: '' }), 600);
  };
  render() {
    return (
      <div className={`Artwork ${this.props.isPlaying ? '' : 'paused'}`} onClick={this.props.onClick}>
        <img ref={this.img} src={this.state.current} alt='' />
        <img className={this.state.hidden} src={this.state.prev} alt='' />
        <div
          className='Progress'
          style={{
            transform: `rotate(${-180 + (this.state.progress / this.props.trackDuration) * 180}deg)`
          }}
        />
      </div>
    );
  }
}
export default Artwork;
