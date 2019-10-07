import React from 'react';
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

export const Artwork = ({ src, isPlaying, trackDuration, initProgress, onClick, onColorChange }) => {
  const imgRef = React.useRef();
  const [currentSrc, setCurrentSrc] = React.useState('');
  const [prevSrc, setPrevSrc] = React.useState(I.BLACK);
  const [progress, setProgress] = React.useState(initProgress);
  const [isHidden, setHidden] = React.useState(false);

  React.useEffect(() => {
    const loadArtwork = async () => {
      setHidden(true);
      setCurrentSrc(await fetchImage(src));
      onColorChange(src ? await splashy(imgRef.current) : ['#777', '#777']);
      const prevSrcTimer = setTimeout(() => {
        setPrevSrc(imgRef.current.src);
        setHidden(false);
      }, 600);
      return () => clearTimeout(prevSrcTimer);
    };
    loadArtwork();
  }, [src]);

  React.useEffect(() => {
    if (isPlaying) {
      const progressInterval = window.setInterval(() => setProgress(progress => progress + 200), 200);
      return () => clearInterval(progressInterval);
    }
  }, [isPlaying]);

  React.useEffect(() => {
    setProgress(0);
  }, [trackDuration]);

  React.useEffect(() => {
    setProgress(initProgress);
  }, [initProgress]);

  return (
    <ArtworkDiv isPlaying={isPlaying} onClick={onClick}>
      <ArtworkImg ref={imgRef} src={currentSrc} alt='' />
      <ArtworkImg isHidden={isHidden} src={prevSrc} alt='' />
      <ProgressDiv progress={progress / trackDuration} />
    </ArtworkDiv>
  );
};
