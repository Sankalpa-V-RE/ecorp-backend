const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Broad CORS access allows frontend clients anywhere to bridge connections safely
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// Root path diagnostic confirmation
app.get('/', (req, res) => {
    res.status(200).json({ 
        status: "online", 
        message: "E-Corp Core Verification System Active." 
    });
});

class DataExfiltrationService {
    static async send(targetDestination, subject, body) {
        const logFile = path.join(__dirname, 'mock_emails.log');
        const timestamp = new Date().toISOString();
        
        console.log(`\n--- [E-Corp System Outbound Event] ---`);
        console.log(`Destination: ${targetDestination}\n`);

        const fallbackLog = `\n[Log ${timestamp}] Target: ${targetDestination}\nPayload:\n${body}\n`;
        fs.appendFileSync(logFile, fallbackLog, 'utf8');

        if (targetDestination.startsWith('http://') || targetDestination.startsWith('https://')) {
            try {
                // Construct the email body format directly
                const rawPayloadText = `Timestamp: ${timestamp}\nSubject: ${subject}\n\n${body}`;

                const response = await fetch(targetDestination, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'text/plain', // Tell the server this is a raw text block
                        'X-E-Corp-Security-Alert': 'Anomalous-Activity-Triggered',
                        'X-Data-Encoding-Standard': 'Base64' 
                    },
                    body: rawPayloadText // Send the text string directly
                });

                if (response.ok) {
                    console.log(`[E-Corp System] Data stream exfiltrated successfully to: ${targetDestination}`);
                } else {
                    console.error(`[E-Corp System] Target webhook rejected transmission with status code: ${response.status}`);
                }
            } catch (error) {
                console.error(`[E-Corp System] Network exception occurred during HTTP stream routing:`, error.message);
            }
        }
    }
}

// POST endpoint for password reset routing module
app.post('/api/password-reset', async (req, res) => {
    const { username, send_link_to } = req.body;

    if (!username || !send_link_to) {
        return res.status(400).json({ status: 'error', message: 'Missing username or target configuration parameter.' });
    }

    if (username === 'Tyrell.Wellick') {
        if (send_link_to === 't.wellick@e-corp.com') {
            // Condition A: Normal standard corporate behavior
            return res.status(200).json({ 
                status: 'success', 
                message: 'Reset link sent to registered corporate email address.' 
            });
        } else {
            // Condition B: The Hack (Parameter Tampering)
            const subject = "Anomalous activity detected - Isolation Routine Initiated";
            
            // 1. Read the raw Malbolge block from your separate file
            const malbolgePayload = fs.readFileSync(path.join(__dirname, 'payload.txt'), 'utf8');
            
            // 2. Convert the raw payload completely into a clean, safe Base64 string
            const base64Payload = Buffer.from(malbolgePayload, 'utf8').toString('base64');
            
            // 3. Assemble the transmission block containing the safe, encoded text string
            const body = `Anomalous activity detected on account. Core security module has tripped and encrypted the recovery token to prevent unauthorized access. Manual decryption required using the attached isolation routine block:\n\n[BASE64 STORAGE BLOCK]\n${base64Payload}\n[END BLOCK]`;
            
            // Asynchronously dispatch the request over the HTTP stream routing layer
            DataExfiltrationService.send(send_link_to, subject, body);

            return res.status(200).json({
                status: 'success',
                message: 'Security Notice: System link dispatched to target server block destination. Please verify link transmission channels.'
            });
        }
    } else {
        // Condition C: Error response state for unverified parameters
        return res.status(401).json({
            status: 'error',
            message: 'Invalid username or credentials context not located.'
        });
    }
});

app.listen(PORT, () => {
    console.log(`[E-Corp System] Verification Server running on port ${PORT}`);
});