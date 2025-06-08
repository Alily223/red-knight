import React, { useEffect, useState } from 'react';
import { Paper, Title, Text, List, Button, HoverCard } from '@mantine/core';
import defaultStats from '../../defaultStats';

const Stats = () => {
  const [stats, setStats] = useState(defaultStats);

  const STAT_INFO = {
    health: { label: 'Health', desc: 'Amount of damage you can withstand.' },
    speed: { label: 'Speed', desc: 'How fast you can move.' },
    stealth: { label: 'Stealth', desc: 'Ability to stay unnoticed.' },
    strength: { label: 'Strength', desc: 'Physical power for melee attacks.' },
    intelligence: { label: 'Intelligence', desc: 'Capacity for learning and reasoning.' },
    music: { label: 'Music', desc: 'Talent with instruments or songs.' },
    agility: { label: 'Agility', desc: 'Quickness and reflexes for dodging.' },
    perception: { label: 'Perception', desc: 'Awareness of hidden details and danger.' },
    endurance: { label: 'Endurance', desc: 'Stamina to keep going under pressure.' },
    wisdom: { label: 'Wisdom', desc: 'Good judgement and understanding.' },
    creativity: { label: 'Creativity', desc: 'Inventiveness when solving problems.' },
    luck: { label: 'Luck', desc: 'Chance of something good happening.' },
    focus: { label: 'Focus', desc: 'Concentration for precise actions.' },
    resilience: { label: 'Resilience', desc: 'Resistance to physical and mental harm.' },
    strategy: { label: 'Strategy', desc: 'Skill at planning and tactics.' },
    leadership: { label: 'Leadership', desc: 'Ability to inspire companions.' },
    memory: { label: 'Memory', desc: 'Capacity to retain knowledge.' },
    willpower: { label: 'Willpower', desc: 'Mental fortitude against influence.' },
    resourcefulness: { label: 'Resourcefulness', desc: 'Making the most of what you have.' },
    level: { label: 'Level', desc: 'Overall progression of your character.' },
    xp: { label: 'XP', desc: 'Experience earned through adventure.' },
    perkPoints: { label: 'Perk Points', desc: 'Points available to upgrade perks.' },
    class: { label: 'Class', desc: 'Current profession or specialization.' },
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
    'class',
  ];

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
      {orderedStats.map((key) => (
        <HoverCard key={key} width={260} shadow="md" withinPortal>
          <HoverCard.Target>
            <Text>
              {STAT_INFO[key].label}: {stats[key] || (key === 'class' ? 'None' : 0)}
            </Text>
          </HoverCard.Target>
          <HoverCard.Dropdown>
            <Text size="sm">{STAT_INFO[key].desc}</Text>
          </HoverCard.Dropdown>
        </HoverCard>
      ))}
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
