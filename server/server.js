import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(cors());
app.use(express.json());

function loadData() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {
    return { users: {}, saves: {} };
  }
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

app.post('/login', (req, res) => {
  const { id, name, email, picture } = req.body;
  if (!id) return res.status(400).json({ error: 'id required' });
  const data = loadData();
  if (!data.users[id]) {
    data.users[id] = { id, name, email, picture, created: new Date().toISOString() };
    saveData(data);
  }
  res.json({ ok: true });
});

app.post('/save', (req, res) => {
  const { id, user, stats } = req.body;
  if (!id) return res.status(400).json({ error: 'id required' });
  const data = loadData();
  data.saves[id] = { user, stats };
  saveData(data);
  res.json({ ok: true });
});

app.get('/save/:id', (req, res) => {
  const id = req.params.id;
  const data = loadData();
  res.json(data.saves[id] || {});
});

async function callAI(prompt) {
  const hf = await fetch('https://api-inference.huggingface.co/models/gpt2', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.HF_TOKEN || ''}`,
    },
    body: JSON.stringify({ inputs: prompt })
  });
  if (!hf.ok) {
    throw new Error('hf');
  }
  return hf.json();
}

app.post('/ai', async (req, res) => {
  const prompt = req.body.prompt || req.body.inputs;
  if (!prompt) return res.status(400).json({ error: 'prompt required' });
  try {
    const j = await callAI(prompt);
    res.json(j);
  } catch {
    res.status(500).json({ error: 'failed' });
  }
});

app.post('/character', async (req, res) => {
  const { seed } = req.body || {};
  const base =
    'Generate a random fantasy RPG character in the format "NAME: <name>; APPEARANCE: <appearance>".';
  const prompt = seed ? `${base} Seed: ${seed}` : base;
  try {
    const j = await callAI(prompt);
    const text = j[0]?.generated_text || '';
    const match = text.match(/NAME:\s*(.*);\s*APPEARANCE:\s*([^\n]+)/i);
    if (match) {
      return res.json({ name: match[1].trim(), appearance: match[2].trim() });
    }
    throw new Error('parse');
  } catch {
    const names = ['Arin', 'Belra', 'Coryn', 'Dorin', 'Ela'];
    const looks = [
      'tall knight',
      'mysterious rogue',
      'wise mage',
      'dwarven miner',
      'elf ranger',
    ];
    const name = names[Math.floor(Math.random() * names.length)];
    const appearance = looks[Math.floor(Math.random() * looks.length)];
    res.json({ name, appearance });
  }
});

app.listen(PORT, () => console.log(`Backend running on ${PORT}`));
