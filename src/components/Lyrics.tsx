import React, {useState} from 'react';
import styled from 'styled-components';
import {IconButton, CircularProgress} from '@material-ui/core';
import {SearchRounded} from '@material-ui/icons';
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

const LyricsContainer = styled.div<{stale: boolean; isLoading: boolean}>`
  margin-top: 10px;
  font-size: 2vh;
  white-space: pre-wrap;
  line-height: 1.5;
  padding: 0 10%;
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

    const {
      results: [lyrics],
      errors: [error],
    } = await api<string>(['lyrics', track.artists[0].name, track.name]);

    if (error) {
      snack(`🥺 ${error.message}`);
      setLyrics(undefined);
    } else {
      setLyrics(lyrics);
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
      <LyricsContainer stale={track.name !== displayedTrack} isLoading={isLoading}>
        {lyrics}
      </LyricsContainer>
    </Container>
  );
};

export {Lyrics};
