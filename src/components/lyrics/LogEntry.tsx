import styled from 'styled-components';
import {Log} from 'models';
import {label} from 'utils';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const Timestamp = styled.span<{hasError: boolean}>`
  color: ${({theme, hasError}) => (hasError ? theme.palette.primary.main : theme.palette.secondary.main)};
  font-size: 0.7rem;
`;

const Meta = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`;

type LogEntryProps = {
  log: Log;
};

const LogEntry = ({log: {type, timestamp, message}}: LogEntryProps) => {
  return (
    <Container>
      <Meta>
        {'err' === type && '⚡️'}
        <Timestamp hasError={'err' === type}>{new Date(timestamp).toLocaleString('en-GB')}</Timestamp>
      </Meta>
      {label(message)}
    </Container>
  );
};

export {LogEntry};
