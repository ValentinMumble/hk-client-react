import React, {useEffect, useRef, useState, useCallback} from 'react';
import styled, {css} from 'styled-components';
import splashy from 'splashy';
import {I, fetchImage} from 'utils';
import {useSnackedApi} from 'hooks';
import {usePalette, useSocket} from 'contexts';
import {PlayerState} from 'models';

const PROGRESS_DELAY = 2000;
const ARTWORK_TRANSITION = 800;

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

const Image = styled.img<{isHidden?: boolean}>`
  width: 100%;
  border-radius: 50%;
  position: absolute;
  transition: all ${ARTWORK_TRANSITION}ms ease;
  opacity: ${({isHidden}) => (isHidden ? 0 : 1)};
`;

const Progress = styled.div.attrs(({percent}: {percent: number}) => ({
  style: {transform: `rotate(${percent * 180 - 180}deg)`},
}))<{percent: number}>`
  position: absolute;
  width: 250%;
  height: 100%;
  right: -75%;
  background: black;
  opacity: 0.3;
  transform-origin: bottom;
`;

type ArtworkProps = {
  src: string;
  isPlaying: boolean;
};

const Artwork = ({src, isPlaying}: ArtworkProps) => {
  const imageRef = useRef<HTMLImageElement>(null);
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const [prevSrc, setPrevSrc] = useState<string>(I.BLACK);
  const [progress, setProgress] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isHidden, setHidden] = useState<boolean>(false);

  const {setPalette} = usePalette();
  const soca = useSocket();
  const snackedApi = useSnackedApi();

  const loadArtwork = useCallback(
    async (src: string) => {
      setHidden(true);
      setCurrentSrc(await fetchImage(src));
      const colors = src ? await splashy(imageRef.current) : ['#777', '#777'];
      setPalette(colors);
      const prevSrcTimer = setTimeout(() => {
        setPrevSrc(imageRef.current?.src || '');
        setHidden(false);
      }, ARTWORK_TRANSITION);

      return () => clearTimeout(prevSrcTimer);
    },
    [setPalette]
  );

  useEffect(() => {
    if (I.BLACK !== src) loadArtwork(src);
  }, [src, loadArtwork]);

  useEffect(() => {
    if (isPlaying) {
      const progressInterval = window.setInterval(
        () => setProgress(progress => progress + PROGRESS_DELAY),
        PROGRESS_DELAY
      );

      return () => clearInterval(progressInterval);
    }
  }, [isPlaying]);

  useEffect(() => {
    if (soca) {
      soca.on('seek', setProgress);
      soca.on('initial_state', ({progress_ms, item: {duration_ms}}: PlayerState) => {
        setProgress(progress_ms);
        if (duration_ms) setDuration(duration_ms);
      });
    }
  }, [soca]);

  return (
    <Container
      isPlaying={isPlaying}
      onClick={() =>
        snackedApi(
          ['soca', 'count'],
          clientCount => `🔌 ${clientCount} client${Number(clientCount) > 1 ? 's' : ''} connected`
        )
      }
    >
      <Image ref={imageRef} src={currentSrc} alt="" />
      <Image isHidden={isHidden} src={prevSrc} alt="" />
      <Progress percent={progress / duration} />
    </Container>
  );
};

export {Artwork};
