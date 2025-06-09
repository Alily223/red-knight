import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';
import Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;
const dbPath = path.join(__dirname, 'database.db');
const db = new Database(dbPath);
db.exec(`
  CREATE TABLE IF NOT EXISTS users(
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT,
    picture TEXT,
    created TEXT
  );
  CREATE TABLE IF NOT EXISTS saves(
    id TEXT PRIMARY KEY,
    user TEXT,
    stats TEXT
  );
  CREATE TABLE IF NOT EXISTS games(
    id TEXT PRIMARY KEY,
    state TEXT
  );
  CREATE TABLE IF NOT EXISTS recipes(
    combo TEXT PRIMARY KEY,
    item TEXT
  );
`);
const aiCache = new Map();

app.use(cors());
app.use(express.json());


app.post('/login', (req, res) => {
  const { id, name, email, picture } = req.body;
  if (!id) return res.status(400).json({ error: 'id required' });
  const existing = db.prepare('SELECT id FROM users WHERE id=?').get(id);
  if (!existing) {
    db.prepare(
      'INSERT INTO users (id, name, email, picture, created) VALUES (?, ?, ?, ?, ?)'
    ).run(id, name, email, picture, new Date().toISOString());
  }
  res.json({ ok: true });
});

app.post('/save', (req, res) => {
  const { id, user, stats } = req.body;
  if (!id) return res.status(400).json({ error: 'id required' });
  db.prepare(
    'INSERT OR REPLACE INTO saves (id, user, stats) VALUES (?, ?, ?)'
  ).run(id, JSON.stringify(user), JSON.stringify(stats));
  res.json({ ok: true });
});

app.post('/game/save', (req, res) => {
  const { id, state } = req.body;
  if (!id) return res.status(400).json({ error: 'id required' });
  db.prepare('INSERT OR REPLACE INTO games (id, state) VALUES (?, ?)').run(
    id,
    JSON.stringify(state)
  );
  res.json({ ok: true });
});

app.get('/game/load/:id', (req, res) => {
  const { id } = req.params;
  const row = db.prepare('SELECT state FROM games WHERE id=?').get(id);
  res.json(row ? JSON.parse(row.state) : {});
});

app.get('/save/:id', (req, res) => {
  const id = req.params.id;
  const row = db.prepare('SELECT user, stats FROM saves WHERE id=?').get(id);
  if (row) {
    res.json({
      user: JSON.parse(row.user || '{}'),
      stats: JSON.parse(row.stats || '{}')
    });
  } else {
    res.json({});
  }
});

async function callAI(prompt) {
  if (aiCache.has(prompt)) {
    return aiCache.get(prompt);
  }
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
  const json = await hf.json();
  aiCache.set(prompt, json);
  return json;
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
      const weight = Math.floor(Math.random() * 5) + 1;
      return res.json({ name: match[1].trim(), description: match[2].trim(), weight });
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
    const weight = Math.floor(Math.random() * 5) + 1;
    res.json({ name: names[i], description: descs[i], weight });
  }
});

app.post('/resource', async (req, res) => {
  const { seed } = req.body || {};
  const base = 'Generate a brand new crafting resource for a fantasy game in the format "NAME: <name>".';
  const prompt = seed ? `${base} Seed: ${seed}` : base;
  try {
    const j = await callAI(prompt);
    const text = j[0]?.generated_text || '';
    const match = text.match(/NAME:\s*([^\n;]+)/i);
    if (match) {
      return res.json({ name: match[1].trim() });
    }
    throw new Error('parse');
  } catch {
    const names = ['Mythril', 'Adamant', 'Soulstone', 'Starshard'];
    const name = names[Math.floor(Math.random() * names.length)];
    res.json({ name });
  }
});

app.post('/craft', async (req, res) => {
  const { resources } = req.body || {};
  if (!resources || !Array.isArray(resources) || resources.length === 0) {
    return res.status(400).json({ error: 'resources required' });
  }
  const combo = resources
    .map(r => `${r.name}:${r.amount || 1}`)
    .sort()
    .join(',');
  const existing = db.prepare('SELECT item FROM recipes WHERE combo=?').get(combo);
  if (existing) {
    return res.json(JSON.parse(existing.item));
  }
  const names = resources.map(r => `${r.amount || 1} ${r.name}`).join(', ');
  const prompt =
    `Craft an item using these materials: ${names}. ` +
    'Respond in the format "NAME: <name>; DESCRIPTION: <description>; WEIGHT: <number>".';
  try {
    const j = await callAI(prompt);
    const text = j[0]?.generated_text || '';
    const match = text.match(/NAME:\s*(.*);\s*DESCRIPTION:\s*([^;]+);\s*WEIGHT:\s*(\d+)/i);
    if (match) {
      const item = {
        name: match[1].trim(),
        description: match[2].trim(),
        weight: parseInt(match[3], 10) || 1
      };
      db.prepare('INSERT OR REPLACE INTO recipes (combo, item) VALUES (?, ?)').run(
        combo,
        JSON.stringify(item)
      );
      return res.json(item);
    }
    throw new Error('parse');
  } catch {
    const count = db.prepare('SELECT COUNT(*) as c FROM recipes').get().c;
    const fallback = {
      name: `Crafted Item ${count + 1}`,
      description: 'An improvised creation.',
      weight: 1
    };
    db.prepare('INSERT OR REPLACE INTO recipes (combo, item) VALUES (?, ?)').run(
      combo,
      JSON.stringify(fallback)
    );
    res.json(fallback);
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
