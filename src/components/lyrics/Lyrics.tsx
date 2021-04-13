import {useState} from 'react';
import styled from 'styled-components';
import {IconButton, CircularProgress} from '@material-ui/core';
import {SearchRounded} from '@material-ui/icons';
import {useBool, useSnackbar, useTrack} from 'hooks';
import {LyricsSearch} from 'models';
import {api} from 'utils';
import {ContentProps} from './ContentProps';

const LyricsContainer = styled.div<{stale: boolean}>`
  white-space: pre-wrap;
  line-height: 1.8;
  color: ${({stale, theme}) => (stale ? '#aaa' : theme.palette.primary.main)};
`;

const Loader = styled.div<{isLoading: boolean}>`
  position: absolute;
  width: 100%;
  height: 100%;
  opacity: ${({isLoading}) => (isLoading ? 0.3 : 0)};
  transition: opacity 400ms ease;
`;

const Lyrics = ({scrollRef, setContent, setLoading}: ContentProps) => {
  const [isLoading, startLoading, stopLoading] = useBool();
  const [displayedTrack, setDisplayedTrack] = useState<string>();

  const snack = useSnackbar();
  const [track] = useTrack();

  const fetchLyrics = async () => {
    if (undefined === track) return;

    startLoading();
    setLoading?.(true);
    setDisplayedTrack(track.name);

    try {
      const {data} = await api<LyricsSearch>(['lyrics', track.artists[0].name, track.name]);
      setContent(<LyricsContainer stale={track?.name !== displayedTrack}>{data.top}</LyricsContainer>);

      if (scrollRef?.current) {
        scrollRef.current.scrollTo(0, 0);
      }
    } catch (error) {
      snack(`🥺 ${error.message}`);
      setContent(undefined);
    } finally {
      setLoading?.(false);
      stopLoading();
    }
  };

  return undefined !== track ? (
    <IconButton onClick={fetchLyrics}>
      <SearchRounded />
      <Loader isLoading={isLoading}>
        <CircularProgress size="100%" />
      </Loader>
    </IconButton>
  ) : null;
};

export {Lyrics};
