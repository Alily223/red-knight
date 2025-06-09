import React from 'react';
import { Paper, Title, Text, List, SimpleGrid } from '@mantine/core';
import { months, formatHour } from '../../time';

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
    <SimpleGrid cols={2} spacing="xs" breakpoints={[{ maxWidth: 'sm', cols: 1 }]}>
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
          {stats.items.map((it, idx) => {
            const itemName = typeof it === 'string' ? it : it.name;
            const w = typeof it === 'object' ? it.weight || 1 : 0;
            return <List.Item key={idx}>{itemName} (w{w})</List.Item>;
          })}
        </List>
      </>
    )}

    <Text size="sm" mt="sm">
      Carry Weight: {stats.weight || 0} / {10 + (stats.strength || 0) * 5}
      { (stats.weight || 0) > 10 + (stats.strength || 0) * 5 ? ' (Encumbered)' : '' }
    </Text>

    {stats.mounts && stats.mounts.length > 0 && (
      <>
        <Title order={4} mt="sm">Mounts</Title>
        <List size="sm" withPadding>
          {stats.mounts.map((m, idx) => (
            <List.Item key={idx}>{m}</List.Item>
          ))}
        </List>
        {stats.activeMount && (
          <Text size="sm">Riding: {stats.activeMount}</Text>
        )}
      </>
    )}

    {stats.vehicles && stats.vehicles.length > 0 && (
      <>
        <Title order={4} mt="sm">Vehicles</Title>
        <List size="sm" withPadding>
          {stats.vehicles.map((v, idx) => (
            <List.Item key={idx}>{v}</List.Item>
          ))}
        </List>
        {stats.activeVehicle && (
          <Text size="sm">In Vehicle: {stats.activeVehicle}</Text>
        )}
      </>
    )}

    {stats.teleportScrolls > 0 && (
      <Text size="sm" mt="sm">Teleport Scrolls: {stats.teleportScrolls}</Text>
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
    {stats.reputation && (
      <>
        <Title order={4} mt="sm">Reputation</Title>
        <List size="sm" withPadding>
          {Object.entries(stats.reputation.factions || {}).map(([name, rep]) => (
            <List.Item key={`f-${name}`}>Faction - {name}: {rep}</List.Item>
          ))}
          {Object.entries(stats.reputation.guilds || {}).map(([name, rep]) => (
            <List.Item key={`g-${name}`}>Guild - {name}: {rep}</List.Item>
          ))}
          {Object.entries(stats.reputation.nations || {}).map(([name, rep]) => (
            <List.Item key={`n-${name}`}>Nation - {name}: {rep}</List.Item>
          ))}
        </List>
      </>
    )}

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

    {stats.buffs && stats.buffs.length > 0 && (
      <>
        <Title order={4} mt="sm">Buffs</Title>
        <List size="sm" withPadding>
          {stats.buffs.map((b, idx) => (
            <List.Item key={idx}>{b.name} x{b.stacks} ({b.duration}h)</List.Item>
          ))}
        </List>
      </>
    )}

    {stats.statusEffects && stats.statusEffects.length > 0 && (
      <>
        <Title order={4} mt="sm">Status Effects</Title>
        <List size="sm" withPadding>
          {stats.statusEffects.map((s, idx) => (
            <List.Item key={idx}>{s.name} ({s.duration}h)</List.Item>
          ))}
        </List>
      </>
    )}

    {stats.worldTime && (
      <>
        <Title order={4} mt="sm">World Time</Title>
        <List size="sm" withPadding>
          <List.Item>Year: {stats.worldTime.year}</List.Item>
          <List.Item>Month: {months[stats.worldTime.month]}</List.Item>
          <List.Item>Day: {stats.worldTime.day}</List.Item>
          <List.Item>Time: {formatHour(stats.worldTime.hour)}</List.Item>
          <List.Item>
            Survival Length: {Math.floor((stats.worldTime.survivalHours || 0)/24)} days { (stats.worldTime.survivalHours || 0)%24 } hours
          </List.Item>
        </List>
      </>
    )}
  </Paper>
);

export default StatsCard;
