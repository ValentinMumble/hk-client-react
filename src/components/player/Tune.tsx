import {useEffect, useState, useCallback} from 'react';
import styled, {css} from 'styled-components';
import splashy from 'splashy';
import {I, fetchImage, formatDuration} from 'utils';
import {usePalette, useSocket, useSnackedApi, useTrack, useTab, useSearch, useBool} from 'hooks';
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

const ArtworkContainer = styled.div<{isPlaying: boolean}>`
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

const TrackContainer = styled.label`
  display: flex;
  flex-direction: column;
  margin: 3vh 0;
  height: 4vh;
  color: ${({theme}) => theme.palette.primary.main};
  font-size: 0.5em;
  text-align: center;
  max-width: min(450px, 92vw);
`;

const Artist = styled.span`
  justify-content: center;
  opacity: 0.5;
  font-style: italic;
  font-size: 0.9em;
  margin-top: 1vh;
`;

const Meta = styled.span`
  opacity: 0.6;
  font-size: 0.8em;
`;

let prevSrcTimer: number;
let progressInterval: number;

type TuneProps = {
  isPlaying: boolean;
};

const Tune = ({isPlaying}: TuneProps) => {
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const [prevSrc, setPrevSrc] = useState<string>(I.BLACK);
  const [progress, setProgress] = useState<number>(0);
  const [isHidden, showArtwork, hideArtwork] = useBool();

  const [, setSearch] = useSearch();
  const [, setTab] = useTab();
  const [activeTrack, setActiveTrack] = useTrack();
  const [, setPalette] = usePalette();
  const [, , sub] = useSocket();
  const snackedApi = useSnackedApi<number>();

  const handleArtistClick = () => {
    if (!activeTrack) return;

    setTab(0);
    setSearch(search => ({...search, artist: activeTrack.artists[0]}));
  };

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

  const [name, ...meta] = (activeTrack?.name ?? '').split(' - ');

  return (
    <>
      <ArtworkContainer
        isPlaying={isPlaying}
        onClick={() => {
          loadArtwork(activeTrack?.album.images[0]?.url);
          snackedApi(['soca', 'count'], clientCount =>
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
      </ArtworkContainer>
      {activeTrack ? (
        <TrackContainer>
          <span
            onClick={() =>
              snackedApi(['spotify', 'playlist', 'add', activeTrack.uri], () => `👌 ${name} added`, 'primary')
            }
          >
            {name}
            <Meta>
              {meta.map(meta => (
                <>&nbsp;&mdash;&nbsp;{meta}</>
              ))}
            </Meta>
          </span>
          <Artist onClick={handleArtistClick}>{activeTrack.artists[0].name}</Artist>
        </TrackContainer>
      ) : (
        <TrackContainer>
          &nbsp;<Artist>loading...</Artist>
        </TrackContainer>
      )}
    </>
  );
};

export {Tune};
