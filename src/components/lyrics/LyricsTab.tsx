import {useRef, useState} from 'react';
import styled from 'styled-components';
import {IconButton, CircularProgress} from '@material-ui/core';
import {ReceiptRounded, SearchRounded} from '@material-ui/icons';
import {useSnackbar, useTrack} from 'hooks';
import {api} from 'utils';

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  width: 100%;
  height: 100%;
`;

type LyricsContainerProps = {stale: boolean; isLoading: boolean};
const LyricsContainer = styled.div<LyricsContainerProps>`
  margin-top: 10px;
  font-size: 2vh;
  white-space: pre-wrap;
  line-height: 1.8;
  padding: 0 8vw;
  overflow: auto;
  width: 100%;
  max-width: 600px;
  max-height: ${({isLoading}) => (isLoading ? 0 : 100)}%;
  opacity: ${({isLoading}) => (isLoading ? 0 : 1)};
  color: ${({stale, theme}) => (stale ? '#777' : theme.palette.primary.main)};
  transition: all 400ms ease;
`;

const Loader = styled.div<{isLoading: boolean}>`
  position: absolute;
  width: 100%;
  height: 100%;
  opacity: ${({isLoading}) => (isLoading ? 0.3 : 0)};
  transition: opacity 400ms ease;
`;

type SearchResult = {
  id: number;
  url: string;
  title: string;
  albumArt: string;
};

type LyricsSearch = {
  results: SearchResult[];
  top: string;
};

const LyricsTab = () => {
  const [isLoading, setLoading] = useState<boolean>(false);
  const [isLogsLoading, setLogsLoading] = useState<boolean>(false);
  const [lyrics, setLyrics] = useState<string>();
  const [displayedTrack, setDisplayedTrack] = useState<string>();
  const scrollRef = useRef<HTMLDivElement>(null);

  const snack = useSnackbar();
  const [track] = useTrack();

  const fetchLyrics = async () => {
    if (undefined === track) return;

    setLoading(true);
    setDisplayedTrack(track.name);

    try {
      const {data} = await api<LyricsSearch>(['lyrics', track.artists[0].name, track.name]);
      setLyrics(data.top);
    } catch (error) {
      snack(`🥺 ${error.message}`);
      setLyrics(undefined);
    }

    setLoading(false);
  };

  const fetchLogs = async () => {
    setLogsLoading(true);

    try {
      const {data} = await api<string>(['logs']);
      setLyrics(data);

      if (scrollRef.current) {
        scrollRef.current.scrollTo(0, scrollRef.current.scrollHeight);
      }
    } catch (error) {
      snack(`🥺 ${error.message}`);
      setLyrics(undefined);
    }

    setLogsLoading(false);
  };

  return (
    <Container>
      <div>
        {undefined !== track && (
          <IconButton onClick={fetchLyrics}>
            <SearchRounded />
            <Loader isLoading={isLoading}>
              <CircularProgress size="100%" />
            </Loader>
          </IconButton>
        )}
        <IconButton onClick={fetchLogs}>
          <ReceiptRounded />
          <Loader isLoading={isLogsLoading}>
            <CircularProgress size="100%" />
          </Loader>
        </IconButton>
      </div>
      <LyricsContainer ref={scrollRef} stale={track?.name !== displayedTrack} isLoading={isLoading || isLogsLoading}>
        {lyrics}
      </LyricsContainer>
    </Container>
  );
};

export {LyricsTab};
