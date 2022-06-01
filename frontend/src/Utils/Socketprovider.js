import socketio from 'socket.io-client';
import React from 'react';
export const socket = socketio.connect(`http://192.168.2.177`);
export const SocketContext = React.createContext();
//test