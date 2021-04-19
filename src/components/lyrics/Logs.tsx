import {useState} from 'react';
import styled from 'styled-components';
import {IconButton, CircularProgress} from '@material-ui/core';
import {ReceiptRounded} from '@material-ui/icons';
import {useSnackbar, useBool} from 'hooks';
import {Log} from 'models';
import {api} from 'utils';
import {ContentProps} from './ContentProps';
import {LogEntry} from './LogEntry';

const LogsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Loader = styled.div<{isLoading: boolean}>`
  position: absolute;
  width: 100%;
  height: 100%;
  opacity: ${({isLoading}) => (isLoading ? 0.3 : 0)};
  transition: opacity 400ms ease;
`;

const Logs = ({scrollRef, setContent, setLoading}: ContentProps) => {
  const [isLoading, startLoading, stopLoading] = useBool();
  const [timestamps, setTimestamps] = useState<string[]>([]);

  const snack = useSnackbar();

  const fetchLogs = async () => {
    startLoading();

    try {
      const {data} = await api<Log[]>(['logs']);

      setContent(
        <LogsContainer>
          {data.map(log => (
            <LogEntry key={log.timestamp + log.message.length} log={log} stale={timestamps.includes(log.timestamp)} />
          ))}
        </LogsContainer>
      );
      setTimestamps(data.map(({timestamp}) => timestamp));

      if (scrollRef?.current) {
        scrollRef.current.scrollTo(0, scrollRef.current.scrollHeight);
      }
    } catch (error) {
      snack(`🥺 ${error.message}`);
    } finally {
      setLoading?.(false);
      stopLoading();
    }
  };

  return (
    <IconButton onClick={fetchLogs}>
      <ReceiptRounded />
      <Loader isLoading={isLoading}>
        <CircularProgress size="100%" />
      </Loader>
    </IconButton>
  );
};

export {Logs};
