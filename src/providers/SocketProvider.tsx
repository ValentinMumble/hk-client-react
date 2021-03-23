import {useRef, ReactNode} from 'react';
import {Manager} from 'socket.io-client';
import {ManagerOptions} from 'socket.io-client/build/manager';
import {Socket} from 'socket.io-client/build/socket';
import {SocketContext, Payload} from 'contexts';

const dico: {[event: string]: {[key: string]: any}} = {};

type SocketProviderProps = {
  url: string;
  namespace: string;
  opts?: Partial<ManagerOptions>;
  children?: ReactNode;
};

const SocketProvider = ({url, namespace, opts, children}: SocketProviderProps) => {
  const soca = useRef<Socket>();

  const emit = (event: string, payload?: Payload) => {
    console.info('Emit', event, payload);
    soca.current?.emit(event, payload);
  };

  const subscribe = (key: string, event: string, callback: any) => {
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
    soca.current = new Manager(url, opts ?? {}).socket(`/${namespace}`);
  }

  return <SocketContext.Provider value={[soca.current, emit, subscribe]}>{children}</SocketContext.Provider>;
};

export {SocketProvider};
