import React from 'react';
import { Paper, Title, Text, List, SimpleGrid } from '@mantine/core';

const STAT_INFO = {
  health: { label: 'Health' },
  speed: { label: 'Speed' },
  stealth: { label: 'Stealth' },
  strength: { label: 'Strength' },
  intelligence: { label: 'Intelligence' },
  music: { label: 'Music' },
  agility: { label: 'Agility' },
  perception: { label: 'Perception' },
  endurance: { label: 'Endurance' },
  wisdom: { label: 'Wisdom' },
  creativity: { label: 'Creativity' },
  luck: { label: 'Luck' },
  focus: { label: 'Focus' },
  resilience: { label: 'Resilience' },
  strategy: { label: 'Strategy' },
  leadership: { label: 'Leadership' },
  memory: { label: 'Memory' },
  willpower: { label: 'Willpower' },
  resourcefulness: { label: 'Resourcefulness' },
  level: { label: 'Level' },
  xp: { label: 'XP' },
  perkPoints: { label: 'Perk Points' },
  coins: { label: 'Coins' },
  class: { label: 'Class' },
};

const orderedStats = [
  'health',
  'speed',
  'stealth',
  'strength',
  'intelligence',
  'music',
  'agility',
  'perception',
  'endurance',
  'wisdom',
  'creativity',
  'luck',
  'focus',
  'resilience',
  'strategy',
  'leadership',
  'memory',
  'willpower',
  'resourcefulness',
  'level',
  'xp',
  'perkPoints',
  'coins',
  'class',
];

const StatsCard = ({ stats }) => (
  <Paper p="sm" shadow="xs" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
    <Title order={3}>Player Stats</Title>
    <SimpleGrid cols={2} spacing="xs">
      {orderedStats.map((key) => (
        <Text key={key} size="sm">
          {STAT_INFO[key].label}: {stats[key] || (key === 'class' ? 'None' : 0)}
        </Text>
      ))}
    </SimpleGrid>

    {stats.items && stats.items.length > 0 && (
      <>
        <Title order={4} mt="sm">Items</Title>
        <List size="sm" withPadding>
          {stats.items.map((it, idx) => (
            <List.Item key={idx}>{it}</List.Item>
          ))}
        </List>
      </>
    )}

    <Title order={4} mt="sm">Resources</Title>
    <List size="sm" withPadding>
      {Object.entries(stats.resources || {}).map(([res, amt]) => (
        res !== 'discovered' && (
          <List.Item key={res}>{res}: {amt}</List.Item>
        )
      ))}
      {Object.entries((stats.resources && stats.resources.discovered) || {}).map(([res, amt]) => (
        <List.Item key={res}>{res}: {amt}</List.Item>
      ))}
    </List>

    {stats.perks && stats.perks.length > 0 && (
      <>
        <Title order={4} mt="sm">Perks</Title>
        <List size="sm" withPadding>
          {stats.perks.map((p, idx) => (
            <List.Item key={idx}>{p.name} (Lv {p.level})</List.Item>
          ))}
        </List>
      </>
    )}

    {stats.places && stats.places.length > 0 && (
      <>
        <Title order={4} mt="sm">Visited</Title>
        <List size="sm" withPadding>
          {stats.places.map((pl, idx) => (
            <List.Item key={idx}>{pl}</List.Item>
          ))}
        </List>
      </>
    )}

    {stats.abilities && stats.abilities.length > 0 && (
      <>
        <Title order={4} mt="sm">Abilities</Title>
        <List size="sm" withPadding>
          {stats.abilities.map((ab, idx) => {
            const ability = typeof ab === 'string' ? { name: ab } : ab;
            return <List.Item key={idx}>{ability.name}</List.Item>;
          })}
        </List>
      </>
    )}
  </Paper>
);

export default StatsCard;
