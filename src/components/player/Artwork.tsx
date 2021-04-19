import {useEffect, useState, useCallback} from 'react';
import styled, {css} from 'styled-components';
import splashy from 'splashy';
import {I, fetchImage, formatDuration} from 'utils';
import {usePalette, useSocket, useSnackedApi, useTrack, useBool} from 'hooks';
import {PlayerState} from 'models';

const ID = 'Tune';
const PROGRESS_DELAY = 500;
const ARTWORK_TRANSITION = 800;

const Duration = styled.span`
  color: ${({theme}) => theme.palette.primary.main};
  padding: 5px;
  position: absolute;
  top: 60%;
  width: 100%;
  text-align: center;
  font-size: 0.5em;
  opacity: 0;
  transition: opacity 1.5s ease;
`;

const Container = styled.div<{isPlaying: boolean}>`
  position: relative;
  width: 100vw;
  max-width: min(450px, 40vh);
  padding-top: min(450px, 40vh);
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

  &:active ${Duration} {
    opacity: 1;
    transition-duration: 0s;
  }
`;

const Image = styled.img<{isHidden: boolean}>`
  position: absolute;
  top: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  transition: all ${ARTWORK_TRANSITION}ms ease;
  opacity: ${({isHidden}) => (isHidden ? 0 : 1)};
`;

type ProgressProps = {ratio: number};
const Progress = styled.svg.attrs(({ratio}: ProgressProps) => ({
  style: {strokeDashoffset: `calc(100% * ${Math.PI} - 98% * ${Math.PI * ratio})`},
}))<ProgressProps>`
  position: absolute;
  top: 0;
  width: 100%;
  height: 100%;

  circle {
    fill: transparent;
    stroke: ${({theme}) => theme.palette.primary.main};
    stroke-linecap: round;
    stroke-width: 2.5%;
    stroke-dasharray: calc(100% * ${Math.PI});
    transform: rotate(-88deg);
    transform-origin: 50% 50%;
    transition: all ${PROGRESS_DELAY * 2}ms linear;
  }
`;

let prevSrcTimer: number;
let progressInterval: number;

type ArtworkProps = {
  isPlaying: boolean;
};

const Artwork = ({isPlaying}: ArtworkProps) => {
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const [prevSrc, setPrevSrc] = useState<string>(I.BLACK);
  const [progress, setProgress] = useState<number>(0);
  const [isHidden, showArtwork, hideArtwork] = useBool();
  const [, setPalette] = usePalette();
  const [, , sub] = useSocket();
  const [activeTrack, setActiveTrack] = useTrack();
  const snackedApi = useSnackedApi();

  const loadArtwork = useCallback(
    async (src?: string) => {
      try {
        const base64 = src ? await fetchImage(src) : I.GRAY;

        if (base64 !== prevSrc) {
          clearTimeout(prevSrcTimer);
          const colors = src ? await splashy(base64) : ['#777', '#777'];
          setCurrentSrc(base64);
          showArtwork();
          setPalette(colors);
          prevSrcTimer = window.setTimeout(() => {
            setPrevSrc(base64);
            hideArtwork();
          }, ARTWORK_TRANSITION);

          return () => clearTimeout(prevSrcTimer);
        }
      } catch (error) {
        console.error('Failed to load src:', src);
      }
    },
    [setPalette, prevSrc]
  );

  useEffect(() => {
    if (activeTrack) loadArtwork(activeTrack.album.images[0]?.url);
  }, [activeTrack, loadArtwork]);

  useEffect(() => {
    if (isPlaying) {
      progressInterval = window.setInterval(() => setProgress(progress => progress + PROGRESS_DELAY), PROGRESS_DELAY);
    }

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
    <Container
      isPlaying={isPlaying}
      onClick={() => {
        loadArtwork(activeTrack?.album.images[0]?.url);
        snackedApi<number>(['soca', 'count'], clientCount =>
          clientCount ? `🤵 ${clientCount} client${clientCount > 1 ? 's' : ''} connected` : '🔌'
        );
      }}
    >
      <Image isHidden={false} src={currentSrc} alt="" />
      <Image isHidden={isHidden} src={prevSrc} alt="" />
      <Progress ratio={activeTrack ? progress / activeTrack.duration_ms : 0}>
        <circle r="49.1%" cx="50%" cy="50%" />
      </Progress>
      <Duration>
        {formatDuration(progress)}/{formatDuration(activeTrack?.duration_ms ?? 0)}
      </Duration>
    </Container>
  );
};

export {Artwork};
