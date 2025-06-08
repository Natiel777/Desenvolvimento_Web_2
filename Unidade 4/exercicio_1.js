const express = require('express'); 
const app = express(); 
const PORT = process.env.PORT || 3000;

app.get('/saudacao/:nome', (req, res) => { 
  const { nome } = req.params; 
  res.send(Olá, ${nome}!); });

app.get('/soma', (req, res) => { 
  const a = parseFloat(req.query.a); 
  const b = parseFloat(req.query.b);

if (isNaN(a) || isNaN(b)) { 
  return res.status(400).json({ error: 'Parâmetros a e b devem ser números válidos.' }); }

const soma = a + b; 
  res.json({ a, b, soma }); });

app.listen(PORT, () => { 
  console.log(`Servidor rodando em http://localhost:${PORT}); }`);
