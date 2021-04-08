import {useEffect, useState, useCallback} from 'react';
import styled, {css} from 'styled-components';
import splashy from 'splashy';
import {I, fetchImage} from 'utils';
import {usePalette, useSocket, useSnackedApi, useTrack, useTab, useSearch, useToggle} from 'hooks';
import {PlayerState, Track} from 'models';

const ID = 'Tune';
const PROGRESS_DELAY = 500;
const ARTWORK_TRANSITION = 800;

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
`;

const Image = styled.img<{isHidden: boolean}>`
  position: absolute;
  top: 0;
  width: 100%;
  border-radius: 50%;
  transition: all ${ARTWORK_TRANSITION}ms ease;
  opacity: ${({isHidden}) => (isHidden ? 0 : 1)};
`;

const Progress = styled.svg.attrs(({ratio}: {ratio: number}) => ({
  style: {strokeDashoffset: `calc(100% * ${Math.PI} - 98% * ${Math.PI * ratio})`},
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
  margin-top: 1vh;
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
  const [isHidden, showArtwork, hideArtwork] = useToggle();

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
        console.error(`Failed to load src: ${src}`);
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
    <>
      <ArtworkContainer
        isPlaying={isPlaying}
        onClick={() =>
          snackedApi(['soca', 'count'], clientCount =>
            clientCount ? `🤵 ${clientCount} client${clientCount > 1 ? 's' : ''} connected` : '🔌'
          )
        }
      >
        <Image isHidden={false} src={currentSrc} alt="" />
        <Image isHidden={isHidden} src={prevSrc} alt="" />
        <Progress ratio={activeTrack ? progress / activeTrack.duration_ms : 0}>
          <circle r="49.1%" cx="50%" cy="50%" />
        </Progress>
      </ArtworkContainer>
      {activeTrack ? (
        <TrackContainer>
          <span
            onClick={() =>
              snackedApi(['spotify', 'playlist', 'add', activeTrack.uri], () => `👌 ${activeTrack.name} added`)
            }
          >
            {activeTrack.name}
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
