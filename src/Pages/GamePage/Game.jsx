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

  useEffect(() => {
    const key = `${position.x},${position.y}`;
    if (!places[key]) {
      places[key] = generateLocation(position.x, position.y);
      setPlaces({ ...places });
    }
    addLog(places[key].description);
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
