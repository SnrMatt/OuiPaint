import express from 'express';
import {Server} from 'socket.io';
import {User} from './Utils/User';
import cors from 'cors';
const app = express();
const server = require('http').createServer(app);


const io = new Server(server, {
    cors:{
        origin:"http://localhost:3000"
    }
})

io.on('connection', (socket)=>{
    var user = new User(socket.id, socket)
    console.log(user.getId() + "has joined!");
})


server.listen(5000, ()=>{
    console.log('Server is running!')
})