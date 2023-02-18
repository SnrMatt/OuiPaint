import express from 'express';
import {Server} from 'socket.io';
import {User} from './Objects/User';
import { Lobby } from './Objects/Lobby';
import cors from 'cors';
const registerUserHandlers = require('./Utils/Listeners/User')
const registerGameboardHandlers = require('./Utils/Listeners/Gameboard')
const app = express();
const server = require('http').createServer(app);

export var activeLobbies:activeLobbies = {}

const io = new Server(server, {
    cors:{
        origin:"http://localhost:3000"
    }
})

io.on('connection', (socket)=>{
    var user = new User(socket.id)
    
    registerUserHandlers(io,socket,user);
    registerGameboardHandlers(io,socket,user)
})


server.listen(5000, ()=>{
    console.log('Server is running!')
})


export interface activeLobbies {
    [id: string]: Lobby
}
