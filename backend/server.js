const express = require('express');
const app = express();
const server = require('http').createServer(app);
const {
    Server
} = require('socket.io');
const io = new Server(server);
app.use(express.static('build'));

var current_list = [];
let lobbies = {};
io.on('connection', (socket) => {
    current_list.push(socket.id)
    //#Handle Room creation, Joining a room, giving room information to users.
    socket.on('request_room', (username) => {
        var id = generateID();
        let set_leader = {
            username: username,
            role: 'leader',
            points: 0,
            background: `rgb(${Math.floor( Math.random()*256/2)},${Math.floor(Math.random()*256/2)},${Math.floor(Math.random()*256/2)})`
        }
        lobbies[id] = {
            users: [set_leader],
            sockets: [socket.id],
            currentUserTurn: 0
        }

        socket.emit('roomID', {
            id: id
        });
    })



    socket.on('validate_room', ({
        id
    }, username) => {
        list = Array.from(io.sockets.adapter.rooms);
        list = list.filter(room => !room[1].has(room[0]))
        list = list.map(rooms => rooms[0])

        let found = list.indexOf(id)
        if (found != -1 || lobbies.length < 6) {
            lobbies[id]['users'].push({
                username: username,
                points: 0,
                role: 'player',
                background: `rgb(${Math.floor( Math.random()*256/2)},${Math.floor(Math.random()*256/2)},${Math.floor(Math.random()*256/2)})`,
            })
            lobbies[id]['sockets'].push(socket.id)
        } else {
            found = -1;
        }
        socket.emit('validation_response', found, {
            id: id
        });
    })



    socket.on('join_room', ({
        id
    }) => {
        id = id.slice(1);
        let currentUserIndex = lobbies[id]['users'].length - 1;
        console.log(currentUserIndex);
        socket.join(id);
        io.to(id).emit('new_user', lobbies[id].users, lobbies[id]['users'][currentUserIndex]);

    })
    //////////////////////////////////////////////////
    //#Handle gameplay start session


    //#Handle Drawing
    socket.on('position', ({
        x,
        y,
        x2,
        y2
    }, {
        id
    }) => {
        id = id.slice(1);
        io.to(id).emit('draw', {
            x,
            y,
            x2,
            y2
        })
    })
    //#Handling Chat message inside the lobby
    socket.on('send_chat', (username, message, {
        id
    }) => {
        id = id.slice(1);
        socket.to(id).emit('new_message', username, message)
    })

    socket.on("disconnect", () => {
        let user = current_list.indexOf(socket.id);
        current_list.splice(user, 1);
    })

})




server.listen(80, () => {
    console.log('Server is on http://localhost')
})

function generateID() {
    return Math.floor((1 + Math.random()) * 0x1000).toString(16).substring();
}