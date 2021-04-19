import styled from 'styled-components';
import {IconButton, CircularProgress} from '@material-ui/core';
import {SearchRounded} from '@material-ui/icons';
import {useBool, useSnackbar, useTrack} from 'hooks';
import {LyricsSearch} from 'models';
import {api} from 'utils';
import {ContentProps} from './ContentProps';

const LyricsContainer = styled.div`
  white-space: pre-wrap;
  line-height: 1.8;
`;

const Track = styled.div`
  color: ${({theme}) => theme.palette.primary.main};
  font-size: 1.2rem;
  position: sticky;
  top: 0;
  background-color: black;
  text-align: center;
  padding-bottom: 10px;
  line-height: 1.5rem;
`;

const Artist = styled.div`
  font-size: 0.8rem;
  opacity: 0.6;
  font-style: italic;
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

  const snack = useSnackbar();
  const [track] = useTrack();

  const fetchLyrics = async () => {
    if (undefined === track) return;

    startLoading();
    setLoading?.(true);

    try {
      const [trackName] = track.name.split(' - ');
      const {data} = await api<LyricsSearch>(['lyrics', track.artists[0].name, trackName]);

      setContent(
        <LyricsContainer>
          <Track>
            {trackName}
            <Artist>{track.artists[0].name}</Artist>
          </Track>
          {data.top}
        </LyricsContainer>
      );

      if (scrollRef?.current) {
        scrollRef.current.scrollTo(0, 0);
      }
    } catch (error) {
      snack(`🥺 ${error.message}`);
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
