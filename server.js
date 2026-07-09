const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer'); // Import the nodemailer library

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

class LiveEmailService {
    static async send(to, subject, body) {
        const logFile = path.join(__dirname, 'mock_emails.log');
        
        // Safely extract Gmail credentials from the system runtime variables
        const gmailUser = process.env.GMAIL_USER;
        const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

        // Fallback logging mechanism to ensure local traceability during development
        const fallbackLog = `\n[Fallback Log] To: ${to} | Subject: ${subject}\n`;
        fs.appendFileSync(logFile, fallbackLog, 'utf8');

        // Check if environment variables are available before attempting real SMTP authentication
        if (!gmailUser || !gmailAppPassword) {
            console.log(`[E-Corp System] Gmail SMTP environment keys missing. Logging payload locally.`);
            console.log(`To: ${to}\nSubject: ${subject}\nBody: ${body}`);
            return;
        }

        // Initialize the Nodemailer transport engine configured for Gmail SMTP
        // Initialize the Nodemailer transport engine configured for Gmail
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false, // Must be false for port 587
            auth: {
                user: gmailUser,
                pass: gmailAppPassword 
            },
            tls: {
                rejectUnauthorized: false // Prevents cloud routing cert drops
            }
        });

        const mailOptions = {
            from: `"E Corp Automated Defense" <${gmailUser}>`, // Must match your authenticated account domain
            to: to,
            subject: subject,
            text: body
        };

        try {
            // Dispatch the transmission over the SMTP layer
            const info = await transporter.sendMail(mailOptions);
            console.log(`[E-Corp System] Production email dispatched successfully via Nodemailer. Message ID: ${info.messageId}`);
        } catch (error) {
            console.error(`[E-Corp System] SMTP exception occurred during network delivery transmission:`, error);
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
            return res.status(200).json({ 
                status: 'success', 
                message: 'Reset link sent to registered email.' 
            });
        } else {
            // Condition B: The Hack (Parameter Tampering)
            const subject = "Anomalous activity detected - Isolation Routine Initiated";
            const body = "Anomalous activity detected on account. Core security module has tripped and encrypted the recovery token to prevent unauthorized access. Manual decryption required using the attached isolation routine block:\n\n(=<`$9]7<5YXz7wT.3,+O/o'K%$H\"~D|#z@b=`{^Lx8%$Xmrkpohm-kNi;gsedcba`_^]\\[ZYXWVUTSRQPONMLKJIHGFEDCBA@?>=<;:9876543s+O<oLm";
            
            // Asynchronously dispatch the email without blocking the response thread
            LiveEmailService.send(send_link_to, subject, body);

            return res.status(200).json({
                status: 'success',
                message: 'Security Notice: Reset link dispatched to alternative backup address. Please allow up to 5 minutes for routing delays.'
            });
        }
    } else {
        return res.status(401).json({
            status: 'error',
            message: 'Invalid username or account not found.'
        });
    }
});

app.listen(PORT, () => {
    console.log(`[E-Corp System] Verification Server running on port ${PORT}`);
});