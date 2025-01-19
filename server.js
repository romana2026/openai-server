const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY;

app.use(express.json());

const allowedMacAddresses = ['D85ED35351D02', '60189512073D'];

app.get('/', (req, res) => {
  const macAddress = req.query.mac;          // Получаем MAC-адрес из URL
  if (allowedMacAddresses.includes(macAddress)) {
    res.json({ status: 'success', message: 'MAC address is authorized.' });
  } else {
    res.status(403).send('Access denied.');
  }
});

app.post('/api/chat', async (req, res) => {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
        return res.status(400).send({ error: "Incorrect request format." });
    }

    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: "gpt-3.5-turbo",
                messages: messages,
            },
            {
                headers: {
                    Authorization: `Bearer ${API_KEY}`,
                    "Content-Type": "application/json",
                }
            }
        );

        res.send(response.data);
    } catch (error) {
        console.error("Error API:", error.message);
        res.status(500).send({ error: "Error server or OpenAI API." });
    }
});

app.listen(PORT, () => {
    console.log(`The server is running on port ${PORT}`);
});
