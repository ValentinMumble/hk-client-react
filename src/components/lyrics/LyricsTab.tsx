import styled from 'styled-components';
import {Lyrics} from './Lyrics';
import {Logs} from './Logs';

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  width: 100%;
  height: 100%;
`;

const LyricsTab = () => {
  return (
    <Container>
      <Lyrics />
      <Logs />
    </Container>
  );
};

export {LyricsTab};
