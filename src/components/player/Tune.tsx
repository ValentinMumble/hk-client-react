import styled from 'styled-components';
import {useSnackedApi, useTrack, useTab, useSearch} from 'hooks';
import {Artwork} from './Artwork';

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

type TuneProps = {
  isPlaying: boolean;
};

const Tune = ({isPlaying}: TuneProps) => {
  const [, setSearch] = useSearch();
  const [, setTab] = useTab();
  const [activeTrack] = useTrack();
  const snackedApi = useSnackedApi();

  const handleTrackClick = () => {
    if (!activeTrack) return;

    snackedApi(['spotify', 'playlist', 'add', activeTrack.uri], () => `👌 ${name} added`, 'primary');
  };

  const handleArtistClick = () => {
    if (!activeTrack) return;

    setTab(0);
    setSearch(search => ({...search, artist: activeTrack.artists[0]}));
  };

  const [name, ...meta] = (activeTrack?.name ?? '').split(' - ');

  return (
    <>
      <Artwork isPlaying={isPlaying} />
      {activeTrack ? (
        <TrackContainer>
          <span onClick={handleTrackClick}>
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
