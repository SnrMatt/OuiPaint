import socketio from "socket.io-client";
import React from "react";
export const socket = socketio.connect(`https://ouipaint.app`);
export const SocketContext = React.createContext();
//test
