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

app.post('/location', async (req, res) => {
  const { seed } = req.body || {};
  const base =
    'Generate a unique fantasy location in the format "NAME: <name>; DESCRIPTION: <description>".';
  const prompt = seed ? `${base} Seed: ${seed}` : base;
  try {
    const j = await callAI(prompt);
    const text = j[0]?.generated_text || '';
    const match = text.match(/NAME:\s*(.*);\s*DESCRIPTION:\s*([^\n]+)/i);
    if (match) {
      return res.json({ name: match[1].trim(), description: match[2].trim() });
    }
    throw new Error('parse');
  } catch {
    const names = ['Crystal Lake', 'Thornwood', 'Iron Hills', 'Shadow Valley'];
    const descs = [
      'A serene lake shimmering with magical energy.',
      'A dense forest full of twisted thorns.',
      'Rolling hills rich with ore deposits.',
      'A valley perpetually cloaked in darkness.',
    ];
    const i = Math.floor(Math.random() * names.length);
    res.json({ name: names[i], description: descs[i] });
  }
});

app.post('/class', async (req, res) => {
  const { seed } = req.body || {};
  const base =
    'Generate a fantasy RPG character class in the format "NAME: <name>; DESCRIPTION: <description>".';
  const prompt = seed ? `${base} Seed: ${seed}` : base;
  try {
    const j = await callAI(prompt);
    const text = j[0]?.generated_text || '';
    const match = text.match(/NAME:\s*(.*);\s*DESCRIPTION:\s*([^\n]+)/i);
    if (match) {
      return res.json({ name: match[1].trim(), description: match[2].trim() });
    }
    throw new Error('parse');
  } catch {
    const names = ['Warrior', 'Mage', 'Rogue', 'Cleric'];
    const descs = [
      'A master of melee combat.',
      'A wielder of arcane magic.',
      'A stealthy trickster.',
      'A holy healer.',
    ];
    const i = Math.floor(Math.random() * names.length);
    res.json({ name: names[i], description: descs[i] });
  }
});

app.post('/item', async (req, res) => {
  const { seed } = req.body || {};
  const base =
    'Generate a unique fantasy item in the format "NAME: <name>; DESCRIPTION: <description>".';
  const prompt = seed ? `${base} Seed: ${seed}` : base;
  try {
    const j = await callAI(prompt);
    const text = j[0]?.generated_text || '';
    const match = text.match(/NAME:\s*(.*);\s*DESCRIPTION:\s*([^\n]+)/i);
    if (match) {
      return res.json({ name: match[1].trim(), description: match[2].trim() });
    }
    throw new Error('parse');
  } catch {
    const names = ['Ancient Sword', 'Mystic Amulet', 'Healing Herb', 'Golden Coin'];
    const descs = [
      'A rusty sword emanating a faint aura.',
      'An amulet engraved with swirling runes.',
      'A herb said to cure any wound.',
      'A coin gleaming with ancient markings.',
    ];
    const i = Math.floor(Math.random() * names.length);
    res.json({ name: names[i], description: descs[i] });
  }
});

app.post('/perk', async (req, res) => {
  const { seed } = req.body || {};
  const base =
    'Generate a RPG perk in the format "NAME: <name>; DESCRIPTION: <description>; STAT: <stat>; TYPE: <percentage|number>; VALUE: <value>".';
  const prompt = seed ? `${base} Seed: ${seed}` : base;
  try {
    const j = await callAI(prompt);
    const text = j[0]?.generated_text || '';
    const match = text.match(/NAME:\s*(.*);\s*DESCRIPTION:\s*([^;]+);\s*STAT:\s*(.*?);\s*TYPE:\s*(percentage|number);\s*VALUE:\s*(\d+)/i);
    if (match) {
      return res.json({
        name: match[1].trim(),
        description: match[2].trim(),
        stat: match[3].trim().toLowerCase(),
        type: match[4].trim().toLowerCase(),
        value: parseInt(match[5], 10)
      });
    }
    throw new Error('parse');
  } catch {
    const perks = [
      { name: 'Tough Skin', description: 'Increase health by 5', stat: 'health', type: 'number', value: 5 },
      { name: 'Swift', description: 'Increase speed by 10%', stat: 'speed', type: 'percentage', value: 10 },
      { name: 'Shadow Walker', description: 'Increase stealth by 1', stat: 'stealth', type: 'number', value: 1 }
    ];
    res.json(perks[Math.floor(Math.random() * perks.length)]);
  }
});

app.listen(PORT, () => console.log(`Backend running on ${PORT}`));
