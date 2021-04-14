import styled from 'styled-components';
import {IconButton, CircularProgress} from '@material-ui/core';
import {ReceiptRounded} from '@material-ui/icons';
import {useSnackbar, useBool} from 'hooks';
import {Log} from 'models';
import {api} from 'utils';
import {ContentProps} from './ContentProps';

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

const LogEntry = styled.div`
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

const Logs = ({scrollRef, setContent, setLoading}: ContentProps) => {
  const [isLoading, startLoading, stopLoading] = useBool();

  const snack = useSnackbar();

  const fetchLogs = async () => {
    startLoading();

    try {
      const {data} = await api<Log[]>(['logs']);

      setContent(
        <LogsContainer>
          {data.map((log, index) => (
            <LogEntry key={index}>
              <Meta>
                {'err' === log.type && '⚡️'}
                <Timestamp hasError={'err' === log.type}>{new Date(log.timestamp).toLocaleString('fr-FR')}</Timestamp>
              </Meta>
              {log.message}
            </LogEntry>
          ))}
        </LogsContainer>
      );

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
