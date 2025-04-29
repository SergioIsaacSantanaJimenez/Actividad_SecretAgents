import { Schema, model } from 'mongoose';

export interface IEmail {
  sender: string;
  recipient: string;
  subject: string;
  encryptedContent: string;
  sentAt: Date;
}

const emailSchema = new Schema<IEmail>({
  sender: { type: String, required: true },
  recipient: { type: String, required: true },
  subject: { type: String, required: true },
  encryptedContent: { type: String, required: true },
  sentAt: { type: Date, default: Date.now }
});

const Email = model<IEmail>('Email', emailSchema);

export default Email;