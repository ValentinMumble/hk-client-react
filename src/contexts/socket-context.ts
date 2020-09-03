import {createContext} from 'react';
import {Value} from 'models';

type Payload = Value | {[key: string]: Value | Value[]};

type SocketContextValue = [
  SocketIOClient.Socket,
  (event: string, payload?: Payload) => void,
  (key: string, event: string, callback: Function) => void
];

const SocketContext = createContext<SocketContextValue | undefined>(undefined);

export type {SocketContextValue, Payload};
export {SocketContext};
