const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY;
const allowedMacAddresses = ['D85ED35351D2', '60189512073D'];

let tokens = {};                     // Хранилище токенов с временем истечения

const TOKEN_EXPIRY_TIME = 5 * 60 * 1000;  // Время жизни токена 5 минут)

app.post('/check-mac', (req, res) => {
 const { mac } = req.body;

 if (allowedMacAddresses.includes(mac))    // Проверяем, разрешён ли MAC-адрес
 {
  const token = generateToken(mac);
  const expiry = Date.now() + TOKEN_EXPIRY_TIME;
  tokens[token] = { mac, expiry };            // Сохраняем токен с временем истечения
  res.json({ success: true, token });
 }
 else  res.status(403).json({ error: 'Unauthorized MAC address' });
});

function generateToken(mac) return Buffer.from(mac + new Date().toISOString()).toString('base64'); }

app.post('/api/chat', async (req, res) => {
 const { messages, token } = req.body;

 if (!messages || !Array.isArray(messages) || !validateToken(token))    // Проверяем токен
  return res.status(400).send({ error: "Invalid or expired token." });

 try {                                                // Отправляем запрос к OpenAI API
  const response = await axios.post( 'https://api.openai.com/v1/chat/completions',
  {
   model: "gpt-3.5-turbo",
   messages: messages,
  },
  {
   headers:
   {
    Authorization: `Bearer ${API_KEY}`,
    "Content-Type": "application/json",
   }
  }
  );
  res.send(response.data);
 }
 catch (error) 
 {
  console.error("Error API:", error.message);
  res.status(500).send({ error: "Error with server or OpenAI API." });
 }
});

function validateToken(token) {                             // Валидация токена
 const tokenData = tokens[token];
 if (!tokenData)  return false;                             // Токен не найден
 if (Date.now() > tokenData.expiry)                         // Токен истёк, удаляем его
 {
  delete tokens[token];
  return false;
 }
 return true;
}

app.listen(PORT, () => { console.log(`The server is running on port ${PORT}`); });
