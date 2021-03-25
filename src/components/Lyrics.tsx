import React, {useState} from 'react';
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
  line-height: 1.5;
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

//TODO extract subcomponents
const Lyrics = () => {
  const [isLoading, setLoading] = useState<boolean>(false);
  const [lyrics, setLyrics] = useState<string>();
  const [displayedTrack, setDisplayedTrack] = useState<string>();

  const snack = useSnackbar();
  const [track] = useTrack();

  if (!track) return null;

  const fetchLyrics = async () => {
    setLoading(true);
    setDisplayedTrack(track.name);

    try {
      const {data} = await api<string>(['lyrics', track.artists[0].name, track.name]);
      setLyrics(data);
    } catch (error) {
      snack(`🥺 ${error.message}`);
      setLyrics(undefined);
    }

    setLoading(false);
  };

  const fetchLogs = async () => {
    setLoading(true);

    try {
      const {data} = await api<string>(['logs']);
      setLyrics(data);
    } catch (error) {
      snack(`🥺 ${error.message}`);
      setLyrics(undefined);
    }

    setLoading(false);
  };

  return (
    <Container>
      <IconButton onClick={fetchLyrics}>
        <SearchRounded />
        <Loader isLoading={isLoading}>
          <CircularProgress size="100%" />
        </Loader>
      </IconButton>
      <IconButton onClick={fetchLogs}>
        <ReceiptRounded />
        <Loader isLoading={isLoading}>
          <CircularProgress size="100%" />
        </Loader>
      </IconButton>
      <LyricsContainer stale={track.name !== displayedTrack} isLoading={isLoading}>
        {lyrics}
      </LyricsContainer>
    </Container>
  );
};

export {Lyrics};
