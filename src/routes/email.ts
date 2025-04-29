import { Router } from 'express';
import { auth } from '../middlewares/auth';
import Email from '../models/email';
import { encrypt, decrypt } from '../services/encryption';
import express from 'express';

const router = Router();
router.use(express.json());

// API
router.get('/inbox/:agentCode', auth, (req, res) => {
  Email.find({ recipient: req.params.agentCode })
    .sort('-sentAt')
    .select('sender subject sentAt')
    .then(emails => {
      res.json({ emails });
    })
    .catch(err => {
      res.status(500).json({ error: 'Error interno' });
    });
});

router.get('/sent/:agentCode', auth, (req, res) => {
  Email.find({ sender: req.params.agentCode })
    .sort('-sentAt')
    .select('recipient subject sentAt')
    .then(emails => {
      res.json({ emails });
    })
    .catch(err => {
      res.status(500).json({ error: 'Error interno' });
    });
});

router.post('/send', auth, (req, res) => {
  const { sender, recipient, subject, content, password } = req.body;
  
  const email = new Email({
    sender,
    recipient,
    subject,
    encryptedContent: encrypt(content, password),
    sentAt: new Date()
  });
  
  email.save()
    .then(savedEmail => {
      res.json({ success: true, id: savedEmail._id });
    })
    .catch(err => {
      res.status(500).json({ error: 'Error al enviar' });
    });
});

router.post('/view', auth, (req, res) => {
  Email.findById(req.body.emailId)
    .then(email => {
      if (!email) {
        return res.status(404).json({ error: 'No encontrado' });
      }
      
      if (req.body.password) {
        try {
          const content = decrypt(email.encryptedContent, req.body.password);
          return res.json({ 
            email: {
              id: email._id,
              sender: email.sender,
              recipient: email.recipient,
              subject: email.subject,
              content,
              sentAt: email.sentAt
            }, 
            success: true 
          });
        } catch (error) {
          return res.json({ error: 'Contraseña incorrecta', success: false });
        }
      } else {
        return res.json({ 
          email: {
            id: email._id,
            sender: email.sender,
            recipient: email.recipient,
            subject: email.subject,
            sentAt: email.sentAt
          }
        });
      }
    })
    .catch(err => {
      res.status(500).json({ error: 'Error interno' });
    });
});

// Vistas
router.get('/', auth, (req, res) => {
  res.render('email/index');
});

router.get('/compose', auth, (req, res) => {
  res.render('email/compose');
});

router.get('/view/:emailId', auth, (req, res) => {
  res.render('email/view', { emailId: req.params.emailId });
});

export default router;