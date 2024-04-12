require('dotenv').config();

const express = require('express');
const sgMail = require('@sendgrid/mail');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'views')));

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'signup.html'));
});

app.post('/signup', (req, res) => {
    const { email } = req.body;
    sendVerificationEmail(email)
        .then(() => {
            res.redirect('/success');
        })
        .catch((error) => {
            console.error('Error sending email:', error);
            res.status(500).send('Failed to send email. Please try again.');
        });
});

app.get('/success', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'success.html'));
});

// Handle email verification
app.get('/verify', (req, res) => {
    const { email } = req.query;

    //do whatever once email is verified (save in database, create user etc)
    res.send(`Email ${email} verified successfully!`);
});

async function sendVerificationEmail(email) {
    const verificationLink = `http://localhost:${PORT}/verify?email=${email}`;

    const msg = {
        to: email,
        from: 'eemailer594@gmail.com',
        subject: 'Email Verification',
        html: `
            <p>Please click the following link to verify your email:</p>
            <a href="${verificationLink}">${verificationLink}</a>
        `
    };

    try {
        await sgMail.send(msg);
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
}

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
