import styled from 'styled-components';
import {Log} from 'models';
import {label} from 'utils';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const Timestamp = styled.span<{isError: boolean}>`
  color: ${({theme, isError}) => (isError ? theme.palette.primary.main : theme.palette.secondary.main)};
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
  const isError = 'err' === type;

  return (
    <Container>
      <Meta>
        {isError && '⚡️'}
        <Timestamp isError={isError}>{new Date(timestamp).toLocaleString('en-GB')}</Timestamp>
      </Meta>
      {label(message)}
    </Container>
  );
};

export {LogEntry};
