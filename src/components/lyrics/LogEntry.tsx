import styled from 'styled-components';
import {Log} from 'models';
import {label} from 'utils';

const Container = styled.div<{stale: boolean}>`
  display: flex;
  flex-direction: column;
  gap: 2px;
  opacity: ${({stale}) => (stale ? 0.6 : 1)};
  transition: opacity 400ms ease;
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

const getTimestampLabel = (timestamp: string, locale = 'en-GB'): string => {
  const date = new Date(timestamp);

  if (date.toUTCString().substring(0, 10) === new Date().toUTCString().substring(0, 10)) {
    return `Today, ${date.toLocaleTimeString(locale)}`;
  }

  return date.toLocaleString(locale);
};

type LogEntryProps = {
  log: Log;
  stale: boolean;
};

const LogEntry = ({stale, log: {type, timestamp, message}}: LogEntryProps) => {
  const isError = 'err' === type;

  return (
    <Container stale={stale}>
      <Meta>
        {isError && '⚡️'}
        <Timestamp isError={isError}>{getTimestampLabel(timestamp)}</Timestamp>
      </Meta>
      {label(message)}
    </Container>
  );
};

export {LogEntry};
