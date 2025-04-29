import express from 'express';
import { join } from 'path';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { engine } from 'express-handlebars';
import { connect } from 'mongoose';
import { config } from 'dotenv';
config();

const users: Record<string, string> = {};

import routes from './routes';

const port = process.env.PORT || 3000;

const app = express();

// 1. Crear el servidor HTTP
const httpServer = createServer(app);

// 2. Crear instancia de socket.io sobre el servidor HTTP
const io = new SocketIOServer(httpServer);

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './src/views');


const publicPath = join(__dirname, '..', 'public');
app.use('/assets', express.static(publicPath));

app.use(routes);


// 6. Conexión Socket.IO
io.on('connection', (socket) => {
    console.log('A new user connected');

    // Unirse a una sala privada basada en correos
    socket.on('joinRoom', ({ user, room }) => {
        socket.join(room);
        socket.data.user = user;
        socket.data.room = room;
        console.log(`${user} joined room: ${room}`);
    });

    // Mensajes dentro de la sala
    socket.on('newMessage', ({ room, user, message }) => {
        socket.to(room).emit('newMessage', {
            user,
            message
        });
    });

    socket.on('disconnect', () => {
        if (socket.data.user) {
            console.log(`${socket.data.user} disconnected`);
        }
    });
});


const uri = process.env.DB_URL;

if (uri) {
    connect(uri).then(() => {
        // Usar httpServer en lugar de app.listen para que Socket.IO funcione
        httpServer.listen(port, () => {
            console.log(`app is running in port ${port}`);
        });
    }).catch(e => {
        console.log('Failed to connect to mongodb', e);
    })
} else {
    // Usar httpServer en lugar de app.listen
    httpServer.listen(port, () => {
        console.log(`app is running in port ${port} without database`);
    });
}