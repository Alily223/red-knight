import React, { useEffect, useState } from 'react';
import { Paper, Title, Text, List, Button } from '@mantine/core';

const defaultStats = {
  health: 100,
  level: 1,
  xp: 0,
  items: [],
  skills: [],
  abilities: [],
  places: [],
  people: [],
};

const Stats = () => {
  const [stats, setStats] = useState(defaultStats);

  useEffect(() => {
    const saved = localStorage.getItem('playerStats');
    if (saved) {
      try {
        setStats(JSON.parse(saved));
      } catch {
        /* ignore */
      }
    }
    const cred = localStorage.getItem('googleCredential');
    if (cred) {
      const { id } = JSON.parse(cred);
      fetch(`/save/${id}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.stats) setStats(d.stats);
        })
        .catch(() => {});
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('playerStats', JSON.stringify(stats));
    const cred = localStorage.getItem('googleCredential');
    if (cred) {
      const { id } = JSON.parse(cred);
      fetch('/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, stats }),
      }).catch(() => {});
    }
  };

  return (
    <Paper p="md" m="md" shadow="xs">
      <Title order={2}>Player Stats</Title>
      <Text>Health: {stats.health}</Text>
      <Text>Level: {stats.level}</Text>
      <Text>XP: {stats.xp}</Text>
      <Title order={3} mt="sm">Items</Title>
      <List size="sm" withPadding>
        {stats.items.map((it, idx) => (
          <List.Item key={idx}>{it}</List.Item>
        ))}
      </List>
      <Title order={3} mt="sm">Visited Locations</Title>
      <List size="sm" withPadding>
        {stats.places.map((pl, idx) => (
          <List.Item key={idx}>{pl}</List.Item>
        ))}
      </List>
      <Button mt="md" onClick={handleSave}>Save Stats</Button>
    </Paper>
  );
};

export default Stats;
