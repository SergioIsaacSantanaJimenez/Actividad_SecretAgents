import crypto from 'crypto';

export function encrypt(text: string, password: string): string {
  const salt = crypto.randomBytes(8).toString('hex');
  const hash = crypto.createHash('sha256').update(password + salt).digest('hex');
  return salt + ':' + hash + ':' + text;
}

export function decrypt(encrypted: string, password: string): string {
  const [salt, hash, text] = encrypted.split(':');
  const checkHash = crypto.createHash('sha256').update(password + salt).digest('hex');
  
  if (hash !== checkHash) {
    throw new Error('Contraseña incorrecta');
  }
  
  return text;
}