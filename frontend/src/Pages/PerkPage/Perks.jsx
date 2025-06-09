import React, { useEffect, useState } from 'react';
import { Paper, Button, Title, Text, Stack } from '@mantine/core';
import defaultStats from '../../defaultStats';

const Perks = () => {
  const [stats, setStats] = useState(defaultStats);

  useEffect(() => {
    const saved = localStorage.getItem('playerStats');
    if (saved) {
      try { setStats(JSON.parse(saved)); } catch {}
    }
  }, []);

  const saveStats = (s) => {
    setStats(s);
    localStorage.setItem('playerStats', JSON.stringify(s));
  };

  const addPerk = () => {
    fetch('/perk', { method: 'POST', headers: { 'Content-Type': 'application/json' } })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(p => {
        const perks = stats.perks || [];
        saveStats({ ...stats, perks: [...perks, { ...p, level: 0 }] });
      })
      .catch(() => {});
  };

  const levelUp = (idx) => {
    if (stats.perkPoints <= 0) return;
    const perks = [...(stats.perks || [])];
    const perk = { ...perks[idx] };
    perk.level += 1;
    const newStats = { ...stats, perkPoints: stats.perkPoints - 1 };
    if (perk.type === 'percentage') {
      const current = newStats[perk.stat] || 0;
      newStats[perk.stat] = current * (1 + perk.value / 100);
    } else {
      const current = newStats[perk.stat] || 0;
      newStats[perk.stat] = current + perk.value;
    }
    perks[idx] = perk;
    newStats.perks = perks;
    saveStats(newStats);
  };

  return (
    <Paper p="md" m="md" shadow="xs">
      <Title order={2}>Perks</Title>
      <Text mb="sm">Available Perk Points: {stats.perkPoints}</Text>
      <Button onClick={addPerk} mb="sm">Generate New Perk</Button>
      <Stack>
        {(stats.perks || []).map((p, idx) => (
          <Paper key={idx} p="sm" shadow="xs">
            <Title order={4}>{p.name} (Lv {p.level})</Title>
            <Text>{p.description}</Text>
            <Button mt="xs" disabled={stats.perkPoints <= 0} onClick={() => levelUp(idx)}>
              Level Up
            </Button>
          </Paper>
        ))}
      </Stack>
    </Paper>
  );
};

export default Perks;
