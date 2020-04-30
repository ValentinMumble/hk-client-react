import React, {useRef, ReactNode} from 'react';
import io from 'socket.io-client';
import {SocketContext} from 'contexts';

type SocketProviderProps = {
  url: string;
  opts?: SocketIOClient.ConnectOpts;
  children?: ReactNode;
};

const SocketProvider = ({url, opts, children}: SocketProviderProps) => {
  const socketRef = useRef<SocketIOClient.Socket>();

  if (!socketRef.current) {
    socketRef.current = io(url, opts || {});
  }

  return <SocketContext.Provider value={socketRef.current}>{children}</SocketContext.Provider>;
};

export {SocketProvider};
