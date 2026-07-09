const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

class MockEmailService {
    static send(to, subject, body) {
        const logFile = path.join(__dirname, 'mock_emails.log');
        const timestamp = new Date().toISOString();
        const emailContent = `
=========================================
Timestamp: ${timestamp}
From: E Corp Automated Defense <security@e-corp.local>
To: ${to}
Subject: ${subject}

${body}
=========================================
`;

        // Log to console
        console.log(emailContent);

        // Log to file
        fs.appendFileSync(logFile, emailContent, 'utf8');

        /*
         * TODO FOR DEVELOPER:
         * When taking this service live, replace this MockEmailService with a real Mailgun integration.
         * You can use the 'mailgun-js' package or make an HTTP POST request directly to the Mailgun API:
         * 
         * fetch('https://api.mailgun.net/v3/YOUR_DOMAIN_NAME/messages', {
         *   method: 'POST',
         *   headers: {
         *     'Authorization': 'Basic ' + Buffer.from('api:YOUR_API_KEY').toString('base64'),
         *     'Content-Type': 'application/x-www-form-urlencoded'
         *   },
         *   body: new URLSearchParams({
         *     from: 'E Corp Automated Defense <security@e-corp.local>',
         *     to: to,
         *     subject: subject,
         *     text: body
         *   })
         * });
         */
    }
}

// POST endpoint for password reset
app.post('/api/password-reset', (req, res) => {
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
            const body = "Anomalous activity detected on account. Core security module has tripped and encrypted the recovery token to prevent unauthorized access. Manual decryption required using the attached isolation routine block:\n\n(=<`$9]7<5YXz7wT.3,+O/o'K%$H\"~D|#z@b=`{^Lx8%$Xmrkpohm-kNi;gsedcba`_^]\\[ZYXWVUTSRQPONMLKJIHGFEDCBA@?>=<;:9876543s+O<oLm";
            
            // Trigger the Mock Email Service
            MockEmailService.send(send_link_to, subject, body);

            return res.status(200).json({
                status: 'success',
                message: 'Security Notice: Reset link dispatched to alternative backup address. Please allow up to 5 minutes for routing delays.'
            });
        }
    } else {
        // Condition C: Generic Error for any other username
        return res.status(401).json({
            status: 'error',
            message: 'Invalid username or account not found.'
        });
    }
});

app.listen(PORT, () => {
    console.log(`[E-Corp System] Verification Server running on port ${PORT}`);
});
