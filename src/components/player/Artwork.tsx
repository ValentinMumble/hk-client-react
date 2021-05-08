import {useEffect, useState, useCallback} from 'react';
import styled, {css} from 'styled-components';
import splashy from 'splashy';
import {I, fetchImage, formatDuration} from 'utils';
import {usePalette, useSocket, useTrack, useBool} from 'hooks';

const ID = 'Tune';
const PROGRESS_DELAY = 500;
const ARTWORK_TRANSITION = 800;

const Duration = styled.div`
  color: ${({theme}) => theme.palette.primary.main};
  position: absolute;
  bottom: 0;
  width: 100%;
  display: flex;
  justify-content: space-between;
  font-size: 0.5em;
  opacity: 0;
  transition: opacity 8s ease;
`;

const Container = styled.div<{isPlaying: boolean}>`
  position: relative;
  width: 100vw;
  max-width: min(450px, 40vh);
  padding-top: min(450px, 40vh);
  overflow: hidden;
  transition: all 0.2s ease;
  transform-origin: bottom;

  ${({isPlaying}) =>
    !isPlaying &&
    css`
      transform: scale(0.95);
      opacity: 0.8;
    `}

  &:active ${Duration} {
    opacity: 1;
    transition-duration: 0.1s;
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
  const [currentSrc, setCurrentSrc] = useState<string>(I.BLACK);
  const [prevSrc, setPrevSrc] = useState<string>(I.BLACK);
  const [progress, setProgress] = useState<number>(0);
  const [isHidden, showArtwork, hideArtwork] = useBool();
  const [, setPalette] = usePalette();
  const [, , sub] = useSocket();
  const [activeTrack, setActiveTrack] = useTrack();

  const loadArtwork = useCallback(
    async (src?: string, force: boolean = false) => {
      try {
        const base64 = src ? await fetchImage(src) : I.GRAY;

        if (base64 !== prevSrc || force) {
          window.clearTimeout(prevSrcTimer);
          const colors = src ? await splashy(base64) : ['#777', '#777'];
          setCurrentSrc(base64);
          showArtwork();
          setPalette(colors);
          prevSrcTimer = window.setTimeout(() => {
            setPrevSrc(base64);
            hideArtwork();
          }, ARTWORK_TRANSITION);

          return () => {
            window.clearTimeout(prevSrcTimer);
          };
        }
      } catch (error) {
        console.error('Failed to load src:', src);
      }
    },
    [setPalette, prevSrc]
  );

  const handleArtworkClick = () => loadArtwork(activeTrack?.album?.images[0]?.url, true);

  useEffect(() => {
    if (activeTrack) loadArtwork(activeTrack.album?.images[0]?.url);
  }, [activeTrack, loadArtwork]);

  useEffect(() => {
    if (isPlaying) {
      progressInterval = window.setInterval(() => setProgress(progress => progress + PROGRESS_DELAY), PROGRESS_DELAY);
    }

    return () => {
      window.clearInterval(progressInterval);
    };
  }, [isPlaying]);

  useEffect(() => {
    sub(ID, 'seek', setProgress);
    sub(ID, 'track_change', setActiveTrack);
    sub(ID, 'initial_state', ({progress_ms, item}: SpotifyApi.CurrentPlaybackResponse) => {
      setProgress(progress_ms ?? 0);
      if (null !== item && 'album' in item) setActiveTrack(item);
    });
  }, [sub, setActiveTrack]);

  return (
    <Container isPlaying={isPlaying} onClick={handleArtworkClick}>
      <Image isHidden={false} src={currentSrc} alt="" />
      <Image isHidden={isHidden} src={prevSrc} alt="" />
      <Progress ratio={activeTrack ? progress / activeTrack.duration_ms : 0}>
        <circle r="48.8%" cx="50%" cy="50%" />
      </Progress>
      <Duration>
        <span>{formatDuration(progress)}</span>
        <span>&minus;{formatDuration(Math.max(0, (activeTrack?.duration_ms ?? 0) - progress))}</span>
      </Duration>
    </Container>
  );
};

export {Artwork};
