import React, { useState, useEffect } from 'react';
import { TextInput, Button, Stack, Paper, Text, Flex } from '@mantine/core';
import StatsCard from './StatsCard';
import defaultStats from '../../defaultStats';

const directions = {
  north: { x: 0, y: 1 },
  south: { x: 0, y: -1 },
  east: { x: 1, y: 0 },
  west: { x: -1, y: 0 },
};

const baseResources = [
  'wood',
  'stone',
  'iron',
  'gold',
  'diamond',
  'ruby',
  'emerald',
  'silver',
  'electronics',
  'copper',
  'gorgonite',
];

function generateLocation(x, y) {
  const adjectives = ['Misty', 'Ancient', 'Quiet', 'Lonely', 'Frozen', 'Green', 'Dark', 'Sunny'];
  const nouns = ['Forest', 'Desert', 'Field', 'Mountain', 'Lake', 'Valley', 'Cavern', 'Village'];
  const seed = Math.abs(x * 31 + y * 17);
  const name = `${adjectives[seed % adjectives.length]} ${nouns[seed % nouns.length]}`;
  const description = `You arrive at the ${name.toLowerCase()}.`;
  return { name, description };
}


const Game = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [log, setLog] = useState([]);
  const [command, setCommand] = useState('');
  const [places, setPlaces] = useState({});
  const [stats, setStats] = useState(() => {
    const saved = localStorage.getItem('gameSave');
    if (saved) {
      try {
        const j = JSON.parse(saved);
        if (j.stats) return { ...defaultStats, ...j.stats };
      } catch {
        /* ignore */
      }
    }
    const savedStats = localStorage.getItem('playerStats');
    if (savedStats) {
      try {
        return { ...defaultStats, ...JSON.parse(savedStats) };
      } catch {
        /* ignore */
      }
    }
    return defaultStats;
  });
  const [encounters, setEncounters] = useState({});

  useEffect(() => {
    loadGame();
  }, []);

  useEffect(() => {
    const abilityName = localStorage.getItem('nextAbility');
    if (abilityName) {
      localStorage.removeItem('nextAbility');
      const ability = (stats.abilities || []).find((a) => {
        if (typeof a === 'string') return a.toLowerCase() === abilityName.toLowerCase();
        return a.name.toLowerCase() === abilityName.toLowerCase();
      });
      if (ability) {
        const desc = typeof ability === 'string' ? '' : ability.description || '';
        addLog(`You use ${typeof ability === 'string' ? ability : ability.name}! ${desc}`);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stats]);

  useEffect(() => {
    const key = `${position.x},${position.y}`;
    const run = async () => {
      if (!places[key]) {
        try {
          const r = await fetch('/location', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ seed: key }),
          });
          if (r.ok) {
            places[key] = await r.json();
          } else {
            throw new Error('fail');
          }
        } catch {
          places[key] = generateLocation(position.x, position.y);
        }
        setPlaces({ ...places });
      }
      const loc = places[key];
      addLog(loc.description);
      if (!stats.places.includes(loc.name)) {
        updateStats({ places: [...stats.places, loc.name] });
      }
      if (!encounters[key]) {
        if (Math.random() < 0.3) {
          const foes = ['goblin', 'orc', 'bandit', 'wolf'];
          const foe = foes[Math.floor(Math.random() * foes.length)];
          encounters[key] = { type: 'enemy', name: foe };
          setEncounters({ ...encounters });
          addLog(`A wild ${foe} appears! Type 'fight' to engage.`);
        } else {
          encounters[key] = null;
          setEncounters({ ...encounters });
        }
      } else if (encounters[key] && encounters[key].type === 'enemy') {
        addLog(`The ${encounters[key].name} is here.`);
      }
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position]);

  function addLog(entry) {
    setLog((l) => [...l, entry]);
  }

  function getState() {
    return {
      position,
      log,
      places,
      stats,
      encounters,
      timestamp: Date.now(),
    };
  }

  function saveGame() {
    const state = getState();
    localStorage.setItem('gameSave', JSON.stringify(state));
    localStorage.setItem('playerStats', JSON.stringify(stats));
    const cred = localStorage.getItem('googleCredential');
    if (cred) {
      const { id } = JSON.parse(cred);
      fetch('/game/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, state })
      }).catch(() => {});
    }
  }

  async function loadGame() {
    let data;
    const cred = localStorage.getItem('googleCredential');
    if (cred) {
      const { id } = JSON.parse(cred);
      try {
        const r = await fetch(`/game/load/${id}`);
        if (r.ok) data = await r.json();
      } catch {
        /* ignore */
      }
    }
    if (!data) {
      const saved = localStorage.getItem('gameSave');
      if (saved) {
        try { data = JSON.parse(saved); } catch { data = null; }
      }
    }
    if (data) {
      if (data.position) setPosition(data.position);
      if (data.log) setLog(data.log);
      if (data.places) setPlaces(data.places);
      if (data.stats) setStats({ ...defaultStats, ...data.stats });
      if (data.encounters) setEncounters(data.encounters);
    }
  }

  useEffect(() => {
    const state = getState();
    localStorage.setItem('gameSave', JSON.stringify(state));
  }, [position, log, places, stats, encounters]);

  function updateStats(patch) {
    const newStats = { ...stats, ...patch };
    setStats(newStats);
    localStorage.setItem('playerStats', JSON.stringify(newStats));
  }

  function handleCommand() {
    const cmd = command.trim().toLowerCase();
    setCommand('');

    if (directions[cmd]) {
      const delta = directions[cmd];
      setPosition((p) => ({ x: p.x + delta.x, y: p.y + delta.y }));
    } else if (cmd === 'look') {
      const place = places[`${position.x},${position.y}`];
      addLog(`You look around. ${place.description}`);
    } else if (cmd === 'stats') {
      addLog(`HP: ${stats.health} | Class: ${stats.class || 'None'} | Position: ${position.x}, ${position.y}`);
    } else if (cmd === 'save') {
      saveGame();
      addLog('Game saved.');
    } else if (cmd === 'load') {
      loadGame().then(() => addLog('Game loaded.')).catch(() => addLog('Failed to load.'));
    } else if (cmd === 'fight') {
      const key = `${position.x},${position.y}`;
      const enc = encounters[key];
      if (enc && enc.type === 'enemy') {
        addLog(`You defeat the ${enc.name}!`);
        setEncounters({ ...encounters, [key]: null });
        const gain = Math.floor(Math.random() * 5) + 1;
        updateStats({ coins: stats.coins + gain });
        addLog(`You loot ${gain} coins from the ${enc.name}.`);
      } else {
        addLog('There is nothing to fight here.');
      }
    } else if (cmd === 'search') {
      fetch('/item', { method: 'POST', headers: { 'Content-Type': 'application/json' } })
        .then((r) => (r.ok ? r.json() : Promise.reject()))
        .then((item) => {
          addLog(`You found ${item.name}! ${item.description}`);
          updateStats({ items: [...stats.items, item.name] });
          const coins = Math.floor(Math.random() * 3);
          if (coins > 0) {
            updateStats({ coins: stats.coins + coins });
            addLog(`You also found ${coins} coins.`);
          }
        })
        .catch(() => addLog('You search but find nothing.'));
    } else if (cmd === 'gather') {
      const res = baseResources[Math.floor(Math.random() * baseResources.length)];
      const rare = res === 'gorgonite';
      const amt = rare ? (Math.random() < 0.05 ? 1 : 0) : Math.floor(Math.random() * 3) + 1;
      if (amt > 0) {
        const newRes = { ...stats.resources };
        newRes[res] = (newRes[res] || 0) + amt;
        updateStats({ resources: newRes });
        addLog(`You gather ${amt} ${res}.`);
      } else {
        addLog('You search but find no useful materials.');
      }
    } else if (cmd === 'discover') {
      fetch('/resource', { method: 'POST', headers: { 'Content-Type': 'application/json' } })
        .then((r) => (r.ok ? r.json() : Promise.reject()))
        .then((d) => {
          const name = d.name.toLowerCase();
          addLog(`You discover a new resource: ${name}.`);
          const newRes = { ...stats.resources };
          if (!newRes.discovered[name]) newRes.discovered[name] = 0;
          updateStats({ resources: newRes });
        })
        .catch(() => addLog('No new resources discovered.'));
    } else if (cmd === 'use gorgonite') {
      if (stats.resources.gorgonite > 0) {
        fetch('/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: 'Create a unique ability name for a fantasy hero' }),
        })
          .then((r) => (r.ok ? r.json() : Promise.reject()))
          .then((d) => {
            const abilityName = d[0]?.generated_text?.split('\n')[0] || 'Mysterious Power';
            return fetch('/ai', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ prompt: `Describe the ability "${abilityName}" in one short sentence.` })
            })
              .then((r2) => (r2.ok ? r2.json() : Promise.reject()))
              .then((d2) => {
                const desc = d2[0]?.generated_text?.split('\n')[0] || '';
                const newRes = { ...stats.resources, gorgonite: stats.resources.gorgonite - 1 };
                updateStats({ resources: newRes, abilities: [...stats.abilities, { name: abilityName, description: desc }] });
                addLog(`The Gorgonite grants you the ability: ${abilityName}.`);
              });
          })
          .catch(() => {
            const ability = { name: `Mystic Power ${Date.now()}`, description: '' };
            const newRes = { ...stats.resources, gorgonite: stats.resources.gorgonite - 1 };
            updateStats({ resources: newRes, abilities: [...stats.abilities, ability] });
            addLog(`The Gorgonite grants you a mysterious power: ${ability.name}.`);
          });
      } else {
        addLog('You have no Gorgonite.');
      }
    } else if (cmd.startsWith('ability ')) {
      const name = cmd.slice(8).trim();
      const ab = (stats.abilities || []).find((a) => {
        if (typeof a === 'string') return a.toLowerCase() === name;
        return a.name.toLowerCase() === name;
      });
      if (ab) {
        const desc = typeof ab === 'string' ? '' : ab.description || '';
        addLog(`You use ${typeof ab === 'string' ? ab : ab.name}! ${desc}`);
      } else {
        addLog('You do not possess that ability.');
      }
    } else if (cmd.startsWith('spend ')) {
      const amt = parseInt(cmd.slice(6), 10);
      if (isNaN(amt) || amt <= 0) {
        addLog('Invalid amount.');
      } else if (stats.coins < amt) {
        addLog('Not enough coins.');
      } else {
        updateStats({ coins: stats.coins - amt });
        addLog(`You spend ${amt} coins.`);
      }
    } else if (cmd.startsWith('ai ')) {
      const prompt = cmd.slice(3);
      fetch('/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      })
        .then((r) => (r.ok ? r.json() : Promise.reject()))
        .then((d) => {
          const text = d[0]?.generated_text || '...';
          addLog(text);
        })
        .catch(() => addLog('AI request failed.'));
    } else if (cmd) {
      addLog('Unknown command.');
    }
  }

  return (
    <Flex align="flex-start" gap="md" p="md">
      <Stack spacing="xs" style={{ flexGrow: 1 }}>
        <Paper shadow="xs" p="md" style={{ height: '300px', overflowY: 'auto' }}>
          {log.map((entry, idx) => (
            <Text key={idx}>{entry}</Text>
          ))}
        </Paper>
        <TextInput
          placeholder="Enter command"
          value={command}
          onChange={(e) => setCommand(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleCommand();
          }}
        />
        <Button onClick={handleCommand}>Submit</Button>
      </Stack>
      <StatsCard stats={stats} />
    </Flex>
  );
};

export default Game;
