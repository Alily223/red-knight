import React, { useEffect, useState } from 'react';
import { Paper, Title, Text, List } from '@mantine/core';

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
      } catch (e) {
        /* empty */
      }
    }
  }, []);

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
    </Paper>
  );
};

export default Stats;
