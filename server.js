const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable Cross-Origin Resource Sharing (CORS) for all frontend origins
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// Visual confirmation route when checking if backend domain is live
app.get('/', (req, res) => {
    res.status(200).json({ 
        status: "online", 
        message: "E-Corp Core Verification System Active." 
    });
});

class LiveEmailService {
    static async send(to, subject, body) {
        const logFile = path.join(__dirname, 'mock_emails.log');
        
        // Extract Brevo keys securely from Render runtime environment fields
        const senderEmail = process.env.GMAIL_USER; 
        const apiKey = process.env.BREVO_API_KEY;

        // Fallback logging mechanism to ensure local traceability
        const fallbackLog = `\n[Fallback Log] To: ${to} | Subject: ${subject}\n`;
        fs.appendFileSync(logFile, fallbackLog, 'utf8');

        // Check if environment variables are available before attempting API dispatch
        if (!apiKey || !senderEmail) {
            console.log(`[E-Corp System] Brevo API keys missing from Environment Variables. Logging payload locally.`);
            console.log(`To: ${to}\nSubject: ${subject}\nBody: ${body}`);
            return;
        }

        try {
            // Dispatch via Brevo's Transactional Email HTTP API Endpoint
            const response = await fetch('https://api.brevo.com/v3/smtp/email', {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'api-key': apiKey,
                    'content-type': 'application/json'
                },
                body: JSON.stringify({
                    sender: {
                        name: "E Corp Automated Defense",
                        email: senderEmail 
                    },
                    to: [{
                        email: to 
                    }],
                    subject: subject,
                    textContent: body
                })
            });

            const data = await response.json();

            if (!response.ok) {
                console.error(`[Brevo API Error] HTTP ${response.status}:`, data);
            } else {
                console.log(`[E-Corp System] Production email dispatched via Brevo HTTP API. Message ID: ${data.messageId}`);
            }
        } catch (error) {
            console.error(`[E-Corp System] HTTP exception occurred during Brevo delivery transmission:`, error);
        }
    }
}

// POST endpoint for password reset
app.post('/api/password-reset', async (req, res) => {
    const { username, send_link_to } = req.body;

    if (!username || !send_link_to) {
        return res.status(400).json({ status: 'error', message: 'Missing username or email parameter.' });
    }

    if (username === 'Tyrell.Wellick') {
        if (send_link_to === 't.wellick@e-corp.com') {
            // Condition A: Normal behavior
            return res.status(200).json({ 
                status: 'success', 
                message: 'Reset link sent to registered email.' 
            });
        } else {
            // Condition B: The Hack (Parameter Tampering)
            const subject = "Anomalous activity detected - Isolation Routine Initiated";
            // Read the raw Malbolge block from a separate text file automatically
            const malbolgePayload = fs.readFileSync(path.join(__dirname, 'payload.txt'), 'utf8');

            const body = `Anomalous activity detected on account. Core security module has tripped and encrypted the recovery token to prevent unauthorized access. Manual decryption required using the attached isolation routine block:\n\n${malbolgePayload}`;
            // Asynchronously dispatch the email over HTTP protocol
            LiveEmailService.send(send_link_to, subject, body);

            return res.status(200).json({
                status: 'success',
                message: 'Security Notice: Reset link dispatched to alternative backup address. Please allow up to 5 minutes for routing delays.'
            });
        }
    } else {
        // Condition C: Error response for alternative username targets
        return res.status(401).json({
            status: 'error',
            message: 'Invalid username or account not found.'
        });
    }
});

app.listen(PORT, () => {
    console.log(`[E-Corp System] Verification Server running on port ${PORT}`);
});