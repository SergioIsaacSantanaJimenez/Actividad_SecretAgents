import { Router } from 'express';
import { sendEmail } from '../models/mailer';
import filesRoutes from './files';
import emailRoutes from './email';

const router = Router();

router.get('', (req, res) => {
    res.render('index');
});

// Página de chat
router.get('/chat', (req, res) => {
    const user = 'Agente 007'; 
    const chatName = 'Chat Secreto';
    res.render('chat', { user, chatName });
});

// Agregar estas dos rutas para los enlaces de la página principal
router.get('/archivos', (req, res) => {
    res.render('upload');  // Puedes cambiar esto por la vista adecuada si existe
});

router.get('/correos', (req, res) => {
    res.render('email/index');  // Asumiendo que existe esta vista
});

router.get('/test', (req, res) => {
    sendEmail(
        'your-user@gmail.com',
        `Let's play Secret Agents`,
        `This is a test email. Let's play!`
    ).then(() => {
        res.send('email sent');
    }).catch(() => {
        res.status(500).send('Failed to send email');
    });
});

router.get('/upload', (req, res) => {
    res.render('upload');
});

// Registrar rutas de archivos en /files
router.use('/files', filesRoutes);

// Registrar rutas de correo en /email
router.use('/email', emailRoutes);

export default router;