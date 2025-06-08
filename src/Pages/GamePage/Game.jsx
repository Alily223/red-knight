import React, { useState, useEffect } from 'react';
import { TextInput, Button, Stack, Paper, Text } from '@mantine/core';

const directions = {
  north: { x: 0, y: 1 },
  south: { x: 0, y: -1 },
  east: { x: 1, y: 0 },
  west: { x: -1, y: 0 },
};

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
  const [stats] = useState({ hp: 100 });
  const [encounters, setEncounters] = useState({});

  useEffect(() => {
    const saved = localStorage.getItem('gameState');
    if (saved) {
      try {
        const { position, log, places } = JSON.parse(saved);
        if (position) setPosition(position);
        if (log) setLog(log);
        if (places) setPlaces(places);
      } catch (e) {
        /* empty */
      }
    }
  }, []);

  useEffect(() => {
    const key = `${position.x},${position.y}`;
    if (!places[key]) {
      places[key] = generateLocation(position.x, position.y);
      setPlaces({ ...places });
    }
    addLog(places[key].description);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position]);

  function addLog(entry) {
    setLog((l) => [...l, entry]);
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
      addLog(`HP: ${stats.hp} | Position: ${position.x}, ${position.y}`);
    } else if (cmd === 'save') {
      localStorage.setItem('gameState', JSON.stringify({ position, log, places }));
      addLog('Game saved.');
    } else if (cmd === 'load') {
      const saved = localStorage.getItem('gameState');
      if (saved) {
        try {
          const data = JSON.parse(saved);
          if (data.position) setPosition(data.position);
          if (data.log) setLog(data.log);
          if (data.places) setPlaces(data.places);
          addLog('Game loaded.');
        } catch (e) {
          addLog('Failed to load.');
        }
      }
    } else if (cmd === 'fight') {
      const key = `${position.x},${position.y}`;
      const enc = encounters[key];
      if (enc && enc.type === 'enemy') {
        addLog(`You defeat the ${enc.name}!`);
        setEncounters({ ...encounters, [key]: null });
      } else {
        addLog('There is nothing to fight here.');
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
    <Stack spacing="xs" p="md">
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
  );
};

export default Game;
