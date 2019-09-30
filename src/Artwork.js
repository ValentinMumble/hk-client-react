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
    this.imgRef = React.createRef();
  }
  componentDidMount() {
    this.loadArtwork();
    this.progressTimer = window.setInterval(() => {
      if (this.props.isPlaying) this.setState({ progress: this.state.progress + 200 });
    }, 200);
  }
  componentDidUpdate(prevProps) {
    if (this.props.src !== prevProps.src) this.loadArtwork();
    if (this.props.trackDuration !== prevProps.trackDuration) this.setState({ progress: 0 });
    if (this.props.progress !== prevProps.progress) this.setState({ progress: this.props.progress });
  }
  loadArtwork = async () => {
    this.setState({ current: this.props.src ? await fetchImage(this.props.src) : I.GRAY, hidden: 'Hidden' });
    this.props.onColorChange(this.props.src ? await splashy(this.imgRef.current) : ['#777', '#777']);
    setTimeout(() => this.setState({ prev: this.state.current, hidden: '' }), 600);
  };
  render() {
    return (
      <div className={`Artwork ${this.props.isPlaying ? '' : 'paused'}`} onClick={this.props.onClick}>
        <img ref={this.imgRef} src={this.state.current} alt='' />
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
