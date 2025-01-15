const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY;
//const API_KEY = "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";
// Middleware для обработки JSON
app.use(express.json());
                                          // Маршрут по умолчанию
app.get('/', (req, res) => {
    res.send('Server work!');
});

// Обработчик POST-запроса для работы с OpenAI
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
