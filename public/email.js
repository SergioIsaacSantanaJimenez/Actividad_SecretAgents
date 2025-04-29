// Funciones para manejar los correos

// Código de agente simulado
const agentCodes = ['Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo'];
const myAgentCode = agentCodes[Math.floor(Math.random() * agentCodes.length)];

// Cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
  // Mostrar código de agente donde sea necesario
  const agentCodeElements = document.querySelectorAll('.agent-code');
  agentCodeElements.forEach(el => {
    el.textContent = myAgentCode;
  });
  
  // Cargar bandeja de entrada si estamos en esa página
  if (document.getElementById('inbox-btn')) {
    loadInbox();
    
    // Eventos de botones
    document.getElementById('inbox-btn').addEventListener('click', loadInbox);
    document.getElementById('sent-btn').addEventListener('click', loadSentEmails);
  }
  
  // Formulario de envío en la página de composición
  const emailForm = document.getElementById('emailForm');
  if (emailForm) {
    document.getElementById('sender').value = myAgentCode;
    emailForm.addEventListener('submit', sendEmail);
  }
  
  // Botón de desencriptación en la página de vista
  const decryptBtn = document.getElementById('decryptBtn');
  if (decryptBtn) {
    decryptBtn.addEventListener('click', function() {
      const password = document.getElementById('decryptPassword').value;
      if (!password) {
        alert('Introduce la contraseña');
        return;
      }
      decryptEmail(password);
    });
    
    // Cargar metadatos del email
    const emailId = document.getElementById('emailId').value;
    if (emailId) {
      loadEmailMetadata(emailId);
    }
  }
});

// Cargar bandeja de entrada
async function loadInbox() {
  const tableBody = document.getElementById('email-table-body');
  tableBody.innerHTML = '<tr><td colspan="3">Cargando...</td></tr>';
  
  try {
    const response = await fetch(`/email/inbox/${myAgentCode}`);
    const data = await response.json();
    
    if (response.ok) {
      displayEmails(data.emails, 'inbox');
    } else {
      tableBody.innerHTML = '<tr><td colspan="3">Error al cargar correos</td></tr>';
    }
  } catch (error) {
    console.error('Error:', error);
    tableBody.innerHTML = '<tr><td colspan="3">Error de conexión</td></tr>';
  }
}

// Cargar correos enviados
async function loadSentEmails() {
  const tableBody = document.getElementById('email-table-body');
  tableBody.innerHTML = '<tr><td colspan="3">Cargando...</td></tr>';
  
  try {
    const response = await fetch(`/email/sent/${myAgentCode}`);
    const data = await response.json();
    
    if (response.ok) {
      displayEmails(data.emails, 'sent');
    } else {
      tableBody.innerHTML = '<tr><td colspan="3">Error al cargar correos</td></tr>';
    }
  } catch (error) {
    console.error('Error:', error);
    tableBody.innerHTML = '<tr><td colspan="3">Error de conexión</td></tr>';
  }
}

// Mostrar emails en la tabla
function displayEmails(emails, type) {
  const tableBody = document.getElementById('email-table-body');
  tableBody.innerHTML = '';
  
  if (emails.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="3">No hay mensajes</td></tr>';
    return;
  }
  
  emails.forEach(email => {
    const row = document.createElement('tr');
    row.onclick = function() {
      window.location.href = `/email/view/${email._id}`;
    };
    
    const date = new Date(email.sentAt).toLocaleString();
    
    if (type === 'inbox') {
      row.innerHTML = `
        <td>${email.sender}</td>
        <td>${email.subject}</td>
        <td>${date}</td>
      `;
    } else {
      row.innerHTML = `
        <td>${email.recipient}</td>
        <td>${email.subject}</td>
        <td>${date}</td>
      `;
    }
    
    tableBody.appendChild(row);
  });
}

// Enviar un correo
async function sendEmail(e) {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const data = {
    sender: formData.get('sender'),
    recipient: formData.get('recipient'),
    subject: formData.get('subject'),
    content: formData.get('content'),
    password: formData.get('password')
  };
  
  try {
    const response = await fetch('/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    
    if (response.ok) {
      alert('Mensaje enviado');
      window.location.href = '/email';
    } else {
      alert(result.error || 'Error al enviar');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error de conexión');
  }
}

// Cargar metadatos de un correo
async function loadEmailMetadata(emailId) {
  try {
    const response = await fetch(`/email/view`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        emailId: emailId,
        password: '' 
      })
    });
    
    const data = await response.json();
    
    if (response.ok && data.email) {
      document.getElementById('emailSubject').textContent = data.email.subject;
      document.getElementById('emailSender').textContent = data.email.sender;
      document.getElementById('emailRecipient').textContent = data.email.recipient;
      document.getElementById('emailDate').textContent = new Date(data.email.sentAt).toLocaleString();
    } else {
      alert('Error al cargar');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error de conexión');
  }
}

// Desencriptar un correo
async function decryptEmail(password) {
  const emailId = document.getElementById('emailId').value;
  
  try {
    const response = await fetch(`/email/view`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        emailId: emailId,
        password: password
      })
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      document.getElementById('emailContent').textContent = data.email.content;
      document.getElementById('contentArea').style.display = 'block';
      document.getElementById('decryptionArea').style.display = 'none';
    } else {
      alert('Contraseña incorrecta');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error de conexión');
  }
}