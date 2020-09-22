import React, {useEffect, useState, useCallback} from 'react';
import styled, {css} from 'styled-components';
import splashy from 'splashy';
import {I, fetchImage} from 'utils';
import {usePalette, useSocket, useSnackedApi, useTrack} from 'hooks';
import {PlayerState} from 'models';

const ID = 'Tune';
const PROGRESS_DELAY = 500;
const ARTWORK_TRANSITION = 800;

const ArtworkContainer = styled.div<{isPlaying: boolean}>`
  position: relative;
  width: 100vw;
  max-width: 450px;
  max-height: 450px;
  padding-top: 100%;
  overflow: hidden;
  transition: all 0.2s ease;
  transform-origin: bottom;
  border-radius: 50%;

  ${({isPlaying}) =>
    !isPlaying &&
    css`
      transform: scale(0.95);
      opacity: 0.8;
    `}
`;

const Image = styled.img<{isHidden?: boolean}>`
  position: absolute;
  top: 0;
  width: 100%;
  border-radius: 50%;

  ${({isHidden}) =>
    isHidden &&
    css`
      opacity: 0;
      transition: all ${ARTWORK_TRANSITION}ms ease;
    `};
`;

const Progress = styled.svg.attrs(({ratio}: {ratio: number}) => ({
  style: {strokeDashoffset: `calc(100% * 3.14 - 100% * 3.14 * ${ratio})`},
}))<{ratio: number}>`
  position: absolute;
  top: 0;
  width: 100%;
  height: 100%;

  circle {
    fill: transparent;
    stroke: ${({theme}) => theme.palette.primary.main};
    stroke-linecap: round;
    stroke-width: 2.5%;
    stroke-dasharray: calc(100% * 3.14), calc(100% * 3.14);
    transform: rotate(-90deg);
    transform-origin: 50% 50%;
    transition: all ${PROGRESS_DELAY * 2}ms linear;
  }
`;

const TrackContainer = styled.label`
  display: flex;
  flex-direction: column;
  margin: 3vh 0;
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
  margin-top: 0.6vh;
`;

let prevSrcTimer: number;

type TuneProps = {
  isPlaying: boolean;
};

const Tune = ({isPlaying}: TuneProps) => {
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const [prevSrc, setPrevSrc] = useState<string>(I.BLACK);
  const [progress, setProgress] = useState<number>(0);
  const [isHidden, setHidden] = useState<boolean>(false);

  const [activeTrack, setActiveTrack] = useTrack();
  const [, setPalette] = usePalette();
  const [, , sub] = useSocket();
  const snackedApi = useSnackedApi<number>();

  const loadArtwork = useCallback(
    async (src?: string) => {
      const base64 = src ? await fetchImage(src) : I.GRAY;

      if (base64 !== prevSrc) {
        clearTimeout(prevSrcTimer);
        const colors = src ? await splashy(base64) : ['#777', '#777'];
        setCurrentSrc(base64);
        setHidden(true);
        setPalette(colors);
        prevSrcTimer = setTimeout(() => {
          setPrevSrc(base64);
          setHidden(false);
        }, ARTWORK_TRANSITION);

        return () => clearTimeout(prevSrcTimer);
      }
    },
    [setPalette, prevSrc]
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
    sub(ID, 'seek', setProgress);
    sub(ID, 'track_change', setActiveTrack);
    sub(ID, 'initial_state', ({progress_ms, item}: PlayerState) => {
      setProgress(progress_ms);
      setActiveTrack(item);
    });
  }, [sub, setActiveTrack]);

  return (
    <>
      <ArtworkContainer
        isPlaying={isPlaying}
        onClick={() =>
          snackedApi(['soca', 'count'], clientCount =>
            clientCount ? `🤵 ${clientCount} client${clientCount > 1 ? 's' : ''} connected` : '🔌'
          )
        }
      >
        <Image src={currentSrc} alt="" />
        <Image isHidden={isHidden} src={prevSrc} alt="" />
        <Progress ratio={activeTrack ? progress / activeTrack.duration_ms : 0}>
          <circle r="49.1%" cx="50%" cy="50%" />
        </Progress>
      </ArtworkContainer>
      {activeTrack ? (
        <TrackContainer
          onClick={() => snackedApi(['spotify', 'addok', activeTrack.uri], () => `👌 ${activeTrack.name} added`)}
        >
          {activeTrack.name}
          <Artist>{activeTrack.artists[0].name}</Artist>
        </TrackContainer>
      ) : (
        <TrackContainer>
          This is<Artist>loading...</Artist>
        </TrackContainer>
      )}
    </>
  );
};

export {Tune};
