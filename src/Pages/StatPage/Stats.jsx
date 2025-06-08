import React, { useEffect, useState } from 'react';
import { Paper, Title, Text, List, Button } from '@mantine/core';
import defaultStats from '../../defaultStats';

const Stats = () => {
  const [stats, setStats] = useState(defaultStats);

  useEffect(() => {
    const saved = localStorage.getItem('playerStats');
    if (saved) {
      try {
        setStats({ ...defaultStats, ...JSON.parse(saved) });
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
          if (d.stats) setStats({ ...defaultStats, ...d.stats });
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
      <Text>Speed: {stats.speed}</Text>
      <Text>Stealth: {stats.stealth}</Text>
      <Text>Strength: {stats.strength}</Text>
      <Text>Intelligence: {stats.intelligence}</Text>
      <Text>Music: {stats.music}</Text>
      <Text>Level: {stats.level}</Text>
      <Text>XP: {stats.xp}</Text>
      <Text>Perk Points: {stats.perkPoints}</Text>
      <Text>Class: {stats.class || 'None'}</Text>
      <Title order={3} mt="sm">Items</Title>
      <List size="sm" withPadding>
        {stats.items.map((it, idx) => (
          <List.Item key={idx}>{it}</List.Item>
        ))}
      </List>
      {stats.perks && stats.perks.length > 0 && (
        <>
          <Title order={3} mt="sm">Perks</Title>
          <List size="sm" withPadding>
            {stats.perks.map((p, idx) => (
              <List.Item key={idx}>{p.name} (Lv {p.level})</List.Item>
            ))}
          </List>
        </>
      )}
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
