import {createContext} from 'react';
import {Value} from 'models';
import {Socket} from 'socket.io-client/build/socket';

type Payload = Value | {[key: string]: Value | Value[]};

type SocketContextValue = [
  Socket,
  (event: string, payload?: Payload) => void,
  (key: string, event: string, callback: Function) => void
];

const SocketContext = createContext<SocketContextValue | undefined>(undefined);

export type {SocketContextValue, Payload};
export {SocketContext};
