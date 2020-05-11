import React, {useRef, ReactNode} from 'react';
import io from 'socket.io-client';
import {SocketContext, Payload} from 'contexts';

type SocketProviderProps = {
  url: string;
  opts?: SocketIOClient.ConnectOpts;
  children?: ReactNode;
};

const dico: {[event: string]: {[key: string]: Function}} = {};

const SocketProvider = ({url, opts, children}: SocketProviderProps) => {
  const soca = useRef<SocketIOClient.Socket>();

  const emit = (event: string, payload?: Payload) => {
    console.info('Emit', event, payload);
    soca.current?.emit(event, payload);
  };

  const subscribe = (key: string, event: string, callback: Function) => {
    if (soca.current) {
      if (!(event in dico)) {
        dico[event] = {};
      }
      dico[event][key] = callback;
      soca.current.off(event);
      Object.values(dico[event]).forEach(callback => soca.current?.on(event, callback));
    }
  };

  if (!soca.current) {
    soca.current = io(url, opts || {});
  }

  return <SocketContext.Provider value={[soca.current, emit, subscribe]}>{children}</SocketContext.Provider>;
};

export {SocketProvider};
