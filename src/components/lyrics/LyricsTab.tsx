import {ReactNode, useRef, useState} from 'react';
import styled from 'styled-components';
import {Lyrics} from './Lyrics';
import {Logs} from './Logs';

const Container = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 20px;
`;

const Content = styled.div<{isVisible: boolean}>`
  font-size: 1rem;
  overflow: auto;
  max-width: min(450px, 90vw);
  max-height: ${({isVisible}) => (isVisible ? 80 : 0)}vh;
  opacity: ${({isVisible}) => (isVisible ? 1 : 0)};
  transition: all 400ms ease;
`;

const LyricsTab = () => {
  const [content, setContent] = useState<ReactNode>();
  const [isLoading, setLoading] = useState<boolean>(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <Container>
      <div>
        <Lyrics scrollRef={scrollRef} setContent={setContent} setLoading={setLoading} />
        <Logs scrollRef={scrollRef} setContent={setContent} setLoading={setLoading} />
      </div>
      <Content ref={scrollRef} isVisible={!isLoading}>
        {content}
      </Content>
    </Container>
  );
};

export {LyricsTab};
