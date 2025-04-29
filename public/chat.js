const socket = io();
let currentUser = '';
let currentRoom = '';

document.getElementById('joinChatForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const myEmail = document.getElementById('myEmail').value.trim();
    const recipientEmail = document.getElementById('recipientEmail').value.trim();

    // Ordena los correos alfabéticamente para generar el mismo roomId
    const roomId = [myEmail, recipientEmail].sort().join('-');

    currentUser = myEmail;
    currentRoom = roomId;

    socket.emit('joinRoom', { user: myEmail, room: roomId });

    document.getElementById('joinChatForm').style.display = 'none';
    document.getElementById('chatUI').style.display = 'block';
});

// Enviar mensaje
document.getElementById('messageForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.getElementById('newMessage');
    const message = input.value;
    if (message.trim()) {
        socket.emit('newMessage', {
            room: currentRoom,
            user: currentUser,
            message
        });
        appendMessage(currentUser, message);
        input.value = '';
    }
});

// Recibir mensaje
socket.on('newMessage', ({ user, message }) => {
    appendMessage(user, message);
});

function appendMessage(user, message) {
    const container = document.getElementById('messages');
    const p = document.createElement('p');
    p.innerHTML = `<strong>${user}:</strong> ${message}`;
    container.appendChild(p);
    container.scrollTop = container.scrollHeight;
}
