import React, {useEffect, useState, useCallback} from 'react';
import styled, {css} from 'styled-components';
import splashy from 'splashy';
import {I, fetchImage} from 'utils';
import {useSnackedApi} from 'hooks';
import {usePalette, useSocket} from 'contexts';
import {PlayerState, Track} from 'models';

const PROGRESS_DELAY = 2000;
const ARTWORK_TRANSITION = 800;

const ArtworkContainer = styled.div<{isPlaying: boolean}>`
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

  ${({isHidden}) =>
    isHidden &&
    css`
      opacity: 0;
      transition: all ${ARTWORK_TRANSITION}ms ease;
    `};
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

const TrackContainer = styled.label`
  display: flex;
  flex-direction: column;
  margin: 4vh 0;
  color: ${({theme}) => theme.palette.primary.main};
  font-size: 0.5em;
  text-align: center;
  max-width: 450px;
`;

const Artist = styled.span`
  justify-content: center;
  opacity: 0.6;
  font-style: italic;
  font-size: 0.8em;
`;

let prevSrcTimer: number;

type ArtworkProps = {
  isPlaying: boolean;
};

const Tune = ({isPlaying}: ArtworkProps) => {
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const [prevSrc, setPrevSrc] = useState<string>(I.BLACK);
  const [progress, setProgress] = useState<number>(0);
  const [isHidden, setHidden] = useState<boolean>(false);
  const [activeTrack, setActiveTrack] = useState<Track>();

  const {setPalette} = usePalette();
  const soca = useSocket();
  const snackedApi = useSnackedApi();

  const loadArtwork = useCallback(
    async (src: string) => {
      clearTimeout(prevSrcTimer);
      const base64 = await fetchImage(src);
      const colors = src ? await splashy(base64) : ['#777', '#777'];
      setCurrentSrc(base64);
      setHidden(true);
      setPalette(colors);
      prevSrcTimer = setTimeout(() => {
        setPrevSrc(base64);
        setHidden(false);
      }, ARTWORK_TRANSITION);

      return () => clearTimeout(prevSrcTimer);
    },
    [setPalette]
  );

  useEffect(() => {
    if (activeTrack) loadArtwork(activeTrack.album.images[0]?.url);
  }, [activeTrack, loadArtwork]);

  useEffect(() => {
    if (!isPlaying) return;

    const progressInterval = window.setInterval(
      () => setProgress(progress => progress + PROGRESS_DELAY),
      PROGRESS_DELAY
    );

    return () => clearInterval(progressInterval);
  }, [isPlaying]);

  useEffect(() => {
    if (!soca) return;

    soca.on('seek', setProgress);
    soca.on('track_change', setActiveTrack);
    soca.on('initial_state', ({progress_ms, item}: PlayerState) => {
      setProgress(progress_ms);
      setActiveTrack(item);
    });
  }, [soca]);

  if (!activeTrack) return null;

  return (
    <>
      <ArtworkContainer
        isPlaying={isPlaying}
        onClick={() =>
          snackedApi(
            ['soca', 'count'],
            clientCount => `🔌 ${clientCount} client${Number(clientCount) > 1 ? 's' : ''} connected`
          )
        }
      >
        <Image src={currentSrc} alt="" />
        <Image isHidden={isHidden} src={prevSrc} alt="" />
        <Progress percent={progress / activeTrack.duration_ms} />
      </ArtworkContainer>
      <TrackContainer
        onClick={() => snackedApi(['spotify', 'addok', activeTrack.uri], () => `👌 ${activeTrack.name} added`)}
      >
        {activeTrack.name}
        <Artist>{activeTrack.artists[0].name}</Artist>
      </TrackContainer>
    </>
  );
};

export {Tune};
