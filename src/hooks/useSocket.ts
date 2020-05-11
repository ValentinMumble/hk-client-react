import {useContext} from 'react';
import {SocketContext, SocketContextValue} from 'contexts';

const useSocket = (): SocketContextValue => {
  const soca = useContext(SocketContext);

  if (!soca) throw new Error('Socket not initialized properly');

  return soca;
};

export {useSocket};
