import React, { Component } from 'react';
import { I, fetchImage } from './util';
import splashy from 'splashy';
import styled from 'styled-components';

const ArtworkDiv = styled.div`
  position: relative;
  width: 100vw;
  max-width: 450px;
  max-height: 100vw;
  flex-grow: 1;
  overflow: hidden;
  transition: all 0.2s ease;
  transform-origin: bottom;
  ${props =>
    !props.isPlaying &&
    `
    transform: scale(0.95);
    opacity: 0.8;
  `}
`;

const ArtworkImg = styled.img`
  width: 100%;
  border-radius: 50%;
  position: absolute;
  transition: all 0.6s ease;
  opacity: ${props => (props.isHidden ? 0 : 1)};
`;

const ProgressDiv = styled.div.attrs(props => ({
  style: {
    transform: `rotate(${-180 + props.progress * 180}deg)`
  }
}))`
  position: absolute;
  width: 250%;
  height: 100%;
  right: -75%;
  background: black;
  opacity: 0.2;
  transform-origin: bottom;
`;

export const Artworkk = ({ src, isPlaying, trackDuration, initProgress, onClick, onColorChange }) => {
  const imgRef = React.useRef();
  const [currentSrc, setCurrentSrc] = React.useState('');
  const [prevSrc, setPrevSrc] = React.useState(I.BLACK);
  const [progress, setProgress] = React.useState(initProgress);
  const [isHidden, setHidden] = React.useState(false);

  React.useEffect(() => {
    const loadArtwork = async () => {
      setHidden(true);
      setCurrentSrc(src ? await fetchImage(src) : I.GRAY);
      onColorChange(src ? await splashy(imgRef.current) : ['#777', '#777']);
      // setTimeout(() => {
      //   setPrevSrc(imgRef.current.src);
      //   setHidden(false);
      // }, 600);
    };
    loadArtwork();
  }, [src]);

  React.useEffect(() => {
    if (isPlaying) {
      const progressInterval = window.setInterval(() => setProgress(progress => progress + 200), 200);
      return () => clearInterval(progressInterval);
    }
  }, [isPlaying]);

  // useEffect(() => {
  //   setProgress(initProgress);
  // }, [initProgress]);

  // useEffect(() => {
  //   setProgress(0);
  // }, [trackDuration]);

  return (
    <ArtworkDiv isPlaying={isPlaying} onClick={onClick}>
      <ArtworkImg ref={imgRef} src={currentSrc} alt='' />
      <ArtworkImg isHidden={isHidden} src={prevSrc} alt='' />
      <ProgressDiv progress={progress / trackDuration} />
    </ArtworkDiv>
  );
};

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
    this.setState({ current: this.props.src ? await fetchImage(this.props.src) : I.GRAY, isHidden: true });
    this.props.onColorChange(this.props.src ? await splashy(this.imgRef.current) : ['#777', '#777']);
    setTimeout(() => this.setState({ prev: this.state.current, isHidden: false }), 600);
  };
  render() {
    return (
      <ArtworkDiv isPlaying={this.props.isPlaying} onClick={this.props.onClick}>
        <ArtworkImg ref={this.imgRef} src={this.state.current} alt='' />
        <ArtworkImg isHidden={this.state.isHidden} src={this.state.prev} alt='' />
        <ProgressDiv progress={this.state.progress / this.props.trackDuration} />
      </ArtworkDiv>
    );
  }
}
export default Artwork;
