const express = require('express');
const multer = require('multer');
const axios = require('axios');
const cors = require('cors');
const FormData = require('form-data');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;
const WEBHOOK_URL = 'https://n8n.avlokai.com/webhook/image';

// Enable CORS and serve static files
app.use(cors());
app.use(express.static(path.join(__dirname)));

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Upload Endpoint
app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('No file uploaded.');
        }

        console.log(`Received file: ${req.file.originalname} (${req.file.mimetype})`);

        // Create FormData for the external request
        const form = new FormData();
        form.append('file', req.file.buffer, {
            filename: req.file.originalname,
            contentType: req.file.mimetype
        });

        // Forward to Webhook
        const response = await axios.post(WEBHOOK_URL, form, {
            headers: {
                ...form.getHeaders()
            }
        });

        console.log('Webhook response:', response.status);
        res.status(200).send('Upload successful');
    } catch (error) {
        console.error('Proxy Error:', error.message);
        if (error.response) {
            console.error('Webhook Error Data:', error.response.data);
            res.status(error.response.status).send(error.response.statusText);
        } else {
            res.status(500).send('Internal Server Error');
        }
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
