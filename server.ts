import express from 'express';
import { createServer as createViteServer } from 'vite';
import twilio from 'twilio';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

let twilioClient = null;

function getTwilioClient() {
  if (!twilioClient) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    if (!accountSid || !authToken) {
      throw new Error('TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN environment variables are required');
    }
    twilioClient = twilio(accountSid, authToken);
  }
  return twilioClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Example API to send an SMS notification using Twilio
  app.post('/api/sms/send', async (req, res) => {
    const { to, message } = req.body;
    
    if (!to || !message) {
      return res.status(400).json({ error: 'Missing "to" or "message" in request body' });
    }

    try {
      const client = getTwilioClient();
      const fromNumber = process.env.TWILIO_PHONE_NUMBER;
      
      if (!fromNumber) {
        return res.status(500).json({ error: 'TWILIO_PHONE_NUMBER is not set.' });
      }

      await client.messages.create({
        body: message,
        from: fromNumber,
        to: to
      });
      
      res.json({ success: true, message: 'Text message sent successfully' });
    } catch (error) {
      console.error('Twilio Error:', error);
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
