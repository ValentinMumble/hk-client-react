import {useState, useRef} from 'react';
import styled from 'styled-components';
import {IconButton, CircularProgress} from '@material-ui/core';
import {ReceiptRounded} from '@material-ui/icons';
import {useSnackbar, useBool} from 'hooks';
import {Log} from 'models';
import {api} from 'utils';

const LogsContainer = styled.div<{isLoading: boolean}>`
  margin-top: 10px;
  font-size: 1rem;
  padding: 0 8vw;
  overflow: auto;
  width: 100%;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-height: ${({isLoading}) => (isLoading ? 0 : 100)}%;
  opacity: ${({isLoading}) => (isLoading ? 0 : 1)};
  transition: all 400ms ease;
`;

const Loader = styled.div<{isLoading: boolean}>`
  position: absolute;
  width: 100%;
  height: 100%;
  opacity: ${({isLoading}) => (isLoading ? 0.3 : 0)};
  transition: opacity 400ms ease;
`;

const LogEntry = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const Timestamp = styled.span`
  color: ${({theme}) => theme.palette.secondary.main};
  font-size: 0.7rem;
`;

const Logs = () => {
  const [isLoading, startLoading, stopLoading] = useBool();
  const [logs, setLogs] = useState<Log[]>();
  const scrollRef = useRef<HTMLDivElement>(null);

  const snack = useSnackbar();

  const fetchLogs = async () => {
    startLoading();

    try {
      const {data} = await api<Log[]>(['logs']);
      setLogs(data);

      console.log(logs);

      if (scrollRef.current) {
        scrollRef.current.scrollTo(0, scrollRef.current.scrollHeight);
      }
    } catch (error) {
      snack(`🥺 ${error.message}`);
      setLogs(undefined);
    } finally {
      stopLoading();
    }
  };

  return (
    <>
      <IconButton onClick={fetchLogs}>
        <ReceiptRounded />
        <Loader isLoading={isLoading}>
          <CircularProgress size="100%" />
        </Loader>
      </IconButton>
      <LogsContainer ref={scrollRef} isLoading={isLoading}>
        {logs?.map((log, index) => (
          <LogEntry key={index}>
            <Timestamp>{new Date(log.timestamp).toLocaleString()}</Timestamp>
            {log.message}
          </LogEntry>
        ))}
      </LogsContainer>
    </>
  );
};

export {Logs};
