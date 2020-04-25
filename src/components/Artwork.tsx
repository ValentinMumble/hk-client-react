import React, {useEffect, useRef, useState, HTMLAttributes} from 'react';
import styled, {css} from 'styled-components';
import splashy from 'splashy';
import {I, fetchImage} from 'utils';
import {usePalette} from 'Theme';

const Container = styled.div<{isPlaying: boolean}>`
  position: relative;
  width: 100vw;
  max-width: 450px;
  max-height: 100vw;
  flex-grow: 1;
  overflow: hidden;
  transition: all 0.2s ease;
  transform-origin: bottom;

  ${({isPlaying}) =>
    !isPlaying &&
    css`
      transform: scale(0.95);
      opacity: 0.8;
    `}
`;

const ArtworkImg = styled.img<{isHidden?: boolean}>`
  width: 100%;
  border-radius: 50%;
  position: absolute;
  transition: all 0.6s ease;
  opacity: ${({isHidden}) => (isHidden ? 0 : 1)};
`;

const ProgressDiv = styled.div.attrs((props: HTMLAttributes<HTMLDivElement> & {progress: number}) => ({
  style: {
    transform: css`rotate(${-180 + props.progress * 180}deg)`,
  },
}))`
  position: absolute;
  width: 250%;
  height: 100%;
  right: -75%;
  background: black;
  opacity: 0.2;
  transform-origin: bottom;
`;

type ArtworkProps = {
  src: string;
  isPlaying: boolean;
  trackDuration: number;
  initProgress: number;
  onClick: () => void;
};

const Artwork = ({src, isPlaying, trackDuration, initProgress, onClick}: ArtworkProps) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const [prevSrc, setPrevSrc] = useState<string>(I.BLACK);
  const [progress, setProgress] = useState<number>(initProgress);
  const [isHidden, setHidden] = useState<boolean>(false);

  const {setPalette} = usePalette();

  useEffect(() => {
    const loadArtwork = async () => {
      setHidden(true);
      setCurrentSrc(await fetchImage(src));
      const colors = src ? await splashy(imgRef.current) : ['#777', '#777'];
      setPalette(colors);
      const prevSrcTimer = setTimeout(() => {
        setPrevSrc(imgRef.current?.src || '');
        setHidden(false);
      }, 600);

      return () => clearTimeout(prevSrcTimer);
    };

    loadArtwork();
  }, [src, setPalette]);

  useEffect(() => {
    if (isPlaying) {
      // const progressInterval = window.setInterval(() => setProgress(progress => progress + 200), 200);
      // return () => clearInterval(progressInterval);
    }
  }, [isPlaying]);

  useEffect(() => setProgress(0), [trackDuration]);

  useEffect(() => setProgress(initProgress), [initProgress]);

  return (
    <Container isPlaying={isPlaying} onClick={onClick}>
      <ArtworkImg ref={imgRef} src={currentSrc} alt="" />
      <ArtworkImg isHidden={isHidden} src={prevSrc} alt="" />
      <ProgressDiv progress={progress / trackDuration} />
    </Container>
  );
};

export {Artwork};
