import React, { useEffect, useState } from 'react';
import { Paper, Title, Text, List, Button, HoverCard, SimpleGrid } from '@mantine/core';
import { months, formatHour } from '../../time';
import { Carousel } from '@mantine/carousel';
import { useNavigate } from 'react-router-dom';
import defaultStats from '../../defaultStats';

const Stats = () => {
  const [stats, setStats] = useState(defaultStats);
  const navigate = useNavigate();

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
    coins: { label: 'Coins', desc: 'Currency used to trade with merchants.' },
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
    'coins',
    'class',
  ];

  useEffect(() => {
    const saved = localStorage.getItem('gameSave');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.stats) setStats({ ...defaultStats, ...data.stats });
      } catch {
        /* ignore */
      }
    } else {
      const legacy = localStorage.getItem('playerStats');
      if (legacy) {
        try { setStats({ ...defaultStats, ...JSON.parse(legacy) }); } catch {}
      }
    }
    const cred = localStorage.getItem('googleCredential');
    if (cred) {
      const { id } = JSON.parse(cred);
      fetch(`/game/load/${id}`)
        .then((r) => (r.ok ? r.json() : Promise.reject()))
        .then((d) => {
          if (d.stats) setStats({ ...defaultStats, ...d.stats });
        })
        .catch(() => {});
    }
  }, []);

  const handleSave = () => {
    const saved = localStorage.getItem('gameSave');
    let state = {};
    if (saved) {
      try { state = JSON.parse(saved); } catch { state = {}; }
    }
    state.stats = stats;
    state.timestamp = Date.now();
    localStorage.setItem('gameSave', JSON.stringify(state));
    localStorage.setItem('playerStats', JSON.stringify(stats));
    const cred = localStorage.getItem('googleCredential');
    if (cred) {
      const { id } = JSON.parse(cred);
      fetch('/game/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, state }),
      }).catch(() => {});
    }
  };

  const handleUseAbility = (name) => {
    localStorage.setItem('nextAbility', name);
    navigate('/Game');
  };

  return (
    <Paper p="md" m="md" shadow="xs">
      <Title order={2}>Player Stats</Title>
      <SimpleGrid cols={2} spacing="xs" breakpoints={[{ maxWidth: 'sm', cols: 1 }]}>
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
      </SimpleGrid>
      <Title order={3} mt="sm">Items</Title>
      <List size="sm" withPadding>
        {stats.items.map((it, idx) => (
          <List.Item key={idx}>{it}</List.Item>
        ))}
      </List>
      <Title order={3} mt="sm">Resources</Title>
      <List size="sm" withPadding>
        {Object.entries(stats.resources).map(([res, amt]) => (
          res !== 'discovered' && (
            <List.Item key={res}>{res}: {amt}</List.Item>
          )
        ))}
        {Object.entries(stats.resources.discovered || {}).map(([res, amt]) => (
          <List.Item key={res}>{res}: {amt}</List.Item>
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
      {stats.abilities && stats.abilities.length > 0 && (
        <>
          <Title order={3} mt="sm">Abilities</Title>
          <Carousel slideSize="70%" height={160} align="start" slideGap="md" withControls>
            {stats.abilities.map((ab, idx) => {
              const ability = typeof ab === 'string' ? { name: ab, description: '' } : ab;
              return (
                <Carousel.Slide key={idx}>
                  <Paper p="sm" shadow="xs">
                    <Title order={4}>{ability.name}</Title>
                    <Text size="sm">{ability.description}</Text>
                    <Button mt="xs" size="xs" onClick={() => handleUseAbility(ability.name)}>
                      Use Ability
                    </Button>
                  </Paper>
                </Carousel.Slide>
              );
            })}
          </Carousel>
        </>
      )}
      {stats.worldTime && (
        <>
          <Title order={3} mt="sm">World Time</Title>
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
      <Button mt="md" onClick={handleSave}>Save Stats</Button>
    </Paper>
  );
};

export default Stats;
