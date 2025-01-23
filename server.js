const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY;
const allowedMacAddresses = ['D85ED35351D2', '60189512073D'];
let validToken = null;

app.post('/check-mac', (req, res) => {   // Маршрут для пров MAC-адр
 const { mac } = req.body;
 if (allowedMacAddresses.includes(mac)) {
  validToken = generateToken(mac);
  res.json({ success: true, token: validToken });
 } else {
  res.status(403).json({ error: "I'm sorry" });
 }
});
function generateToken(mac) {
 return Buffer.from(mac + new Date().toISOString()).toString('base64');
}
app.post('/api/chat', async (req, res) => {
 const { messages, token } = req.body;
 if (!messages || !Array.isArray(messages) || token !== validToken) {
  return res.status(400).send({ error: "Invalid request access." });
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
  res.status(500).send({ error: "Error with server or OpenAI API." });
 }
});

app.listen(PORT, () => {
    console.log(`The server is running on port ${PORT}`);
});
