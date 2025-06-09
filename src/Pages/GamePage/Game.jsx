import React, { useState, useEffect, useRef } from 'react';
import { TextInput, Button, Stack, Paper, Text, Flex } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import StatsCard from './StatsCard';
import defaultStats from '../../defaultStats';
import { months } from '../../time';

const directions = {
  north: { x: 0, y: 1 },
  south: { x: 0, y: -1 },
  east: { x: 1, y: 0 },
  west: { x: -1, y: 0 },
};

const baseResources = [
  'wood',
  'stone',
  'iron',
  'gold',
  'diamond',
  'ruby',
  'emerald',
  'silver',
  'electronics',
  'copper',
  'gorgonite',
];

const CARRY_PER_STRENGTH = 5;
const MOUNT_SPEED_MULT = 2;
const VEHICLE_SPEED_MULT = 3;

function parseCommand(input) {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const parts = trimmed.split(/\s+/);
  const verb = parts[0].toLowerCase();
  const args = parts.slice(1);
  const arg = args.join(' ');

  if (directions[verb]) {
    return { type: 'move', dir: verb, args, arg };
  }
  if ((verb === 'go' || verb === 'move' || verb === 'walk' || verb === 'ride' || verb === 'drive') && directions[args[0]]) {
    return { type: 'move', dir: args[0], args: args.slice(1), arg: args.slice(1).join(' ') };
  }

  return { type: verb, args, arg };
}

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
  const inputRef = useRef(null);
  const logRef = useRef(null);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [stats, setStats] = useState(() => {
    const saved = localStorage.getItem('gameSave');
    if (saved) {
      try {
        const j = JSON.parse(saved);
        if (j.stats) return { ...defaultStats, ...j.stats };
      } catch {
        /* ignore */
      }
    }
    const savedStats = localStorage.getItem('playerStats');
    if (savedStats) {
      try {
        return { ...defaultStats, ...JSON.parse(savedStats) };
      } catch {
        /* ignore */
      }
    }
    return defaultStats;
  });
  const [encounters, setEncounters] = useState({});

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [log]);

  useEffect(() => {
    loadGame();
  }, []);

  useEffect(() => {
    const abilityName = localStorage.getItem('nextAbility');
    if (abilityName) {
      localStorage.removeItem('nextAbility');
      const ability = (stats.abilities || []).find((a) => {
        if (typeof a === 'string') return a.toLowerCase() === abilityName.toLowerCase();
        return a.name.toLowerCase() === abilityName.toLowerCase();
      });
      if (ability) {
        const desc = typeof ability === 'string' ? '' : ability.description || '';
        addLog(`You use ${typeof ability === 'string' ? ability : ability.name}! ${desc}`);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stats]);

  useEffect(() => {
    const key = `${position.x},${position.y}`;
    const run = async () => {
      if (!places[key]) {
        try {
          const r = await fetch('/location', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ seed: key }),
          });
          if (r.ok) {
            places[key] = await r.json();
          } else {
            throw new Error('fail');
          }
        } catch {
          places[key] = generateLocation(position.x, position.y);
        }
        setPlaces({ ...places });
      }
      const loc = places[key];
      addLog(loc.description);
      if (!stats.places.includes(loc.name)) {
        updateStats({ places: [...stats.places, loc.name] });
      }
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
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position]);

  function addLog(entry) {
    setLog((l) => [...l, entry]);
  }

  function getState() {
    return {
      position,
      log,
      places,
      stats,
      encounters,
      timestamp: Date.now(),
    };
  }

  function getMaxWeight() {
    return 10 + (stats.strength || 0) * CARRY_PER_STRENGTH;
  }

  function applyBuffEffect({ name, stat, value, duration, stackable = true }) {
    setStats(prev => {
      const buffs = [...(prev.buffs || [])];
      const idx = buffs.findIndex(b => b.name === name);
      let delta = 0;
      if (idx >= 0) {
        const b = { ...buffs[idx] };
        if (b.stackable) {
          b.stacks += 1;
          b.duration = Math.max(b.duration, duration);
          b.value = b.valuePerStack * b.stacks;
          delta = value;
        } else {
          b.duration = Math.max(b.duration, duration);
        }
        buffs[idx] = b;
      } else {
        buffs.push({ name, stat, valuePerStack: value, value, duration, stacks: 1, stackable });
        delta = value;
      }
      const newStats = { ...prev, buffs };
      if (stat && delta !== 0) newStats[stat] = (newStats[stat] || 0) + delta;
      return newStats;
    });
  }

  function addStatusEffect(effect) {
    setStats(prev => ({ ...prev, statusEffects: [...(prev.statusEffects || []), effect] }));
  }

  function incrementGameTime(hours = 1) {
    setStats((prev) => {
      const wt = { ...prev.worldTime };
      wt.survivalHours += hours;
      wt.hour += hours;
      while (wt.hour >= 24) {
        wt.hour -= 24;
        wt.day += 1;
      }
      while (wt.day > 30) {
        wt.day -= 30;
        wt.month += 1;
      }
      while (wt.month >= months.length) {
        wt.month -= months.length;
        wt.year += 1;
      }

      const newStats = { ...prev, worldTime: wt };

      if (prev.buffs) {
        const updated = [];
        for (const b of prev.buffs) {
          const dur = b.duration - hours;
          if (dur > 0) {
            updated.push({ ...b, duration: dur });
          } else if (b.stat) {
            newStats[b.stat] = (newStats[b.stat] || 0) - b.value;
          }
        }
        newStats.buffs = updated;
      }

      if (prev.statusEffects) {
        const updatedS = [];
        for (const s of prev.statusEffects) {
          const dur = s.duration - hours;
          if (s.name === 'poison') {
            newStats.health = Math.max(0, (newStats.health || 0) - (s.damage || 0) * hours);
          }
          if (dur > 0) {
            updatedS.push({ ...s, duration: dur });
          }
        }
        newStats.statusEffects = updatedS;
      }

      return newStats;
    });
  }

  function saveGame() {
    const state = getState();
    localStorage.setItem('gameSave', JSON.stringify(state));
    localStorage.setItem('playerStats', JSON.stringify(stats));
    const cred = localStorage.getItem('googleCredential');
    if (cred) {
      const { id } = JSON.parse(cred);
      fetch('/game/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, state })
      }).catch(() => {});
    }
  }

  async function loadGame() {
    let data;
    const cred = localStorage.getItem('googleCredential');
    if (cred) {
      const { id } = JSON.parse(cred);
      try {
        const r = await fetch(`/game/load/${id}`);
        if (r.ok) data = await r.json();
      } catch {
        /* ignore */
      }
    }
    if (!data) {
      const saved = localStorage.getItem('gameSave');
      if (saved) {
        try { data = JSON.parse(saved); } catch { data = null; }
      }
    }
    if (data) {
      if (data.position) setPosition(data.position);
      if (data.log) setLog(data.log);
      if (data.places) setPlaces(data.places);
      if (data.stats) setStats({ ...defaultStats, ...data.stats });
      if (data.encounters) setEncounters(data.encounters);
    }
  }

  useEffect(() => {
    const state = getState();
    localStorage.setItem('gameSave', JSON.stringify(state));
  }, [position, log, places, stats, encounters]);

  function updateStats(patch) {
    const newStats = { ...stats, ...patch };
    if (patch.worldTime) {
      newStats.worldTime = { ...stats.worldTime, ...patch.worldTime };
    }
    if (patch.reputation) {
      newStats.reputation = {
        ...stats.reputation,
        ...patch.reputation,
        factions: { ...(stats.reputation?.factions || {}), ...(patch.reputation.factions || {}) },
        guilds: { ...(stats.reputation?.guilds || {}), ...(patch.reputation.guilds || {}) },
        nations: { ...(stats.reputation?.nations || {}), ...(patch.reputation.nations || {}) },
      };
    }
    setStats(newStats);
    localStorage.setItem('playerStats', JSON.stringify(newStats));
  }

  function handleCommand() {
    const parsed = parseCommand(command);
    setCommand('');
    if (!parsed) {
      addLog('Please enter a command.');
      inputRef.current?.focus();
      return;
    }

    if (parsed.type === 'move') {
      const dir = parsed.dir;
      if (directions[dir]) {
        const delta = directions[dir];
        const mult = stats.activeVehicle ? VEHICLE_SPEED_MULT : (stats.activeMount ? MOUNT_SPEED_MULT : 1);
        setPosition((p) => ({ x: p.x + delta.x * mult, y: p.y + delta.y * mult }));
      } else {
        addLog('Unknown direction.');
      }
    } else if (parsed.type === 'mount') {
      const name = parsed.arg.toLowerCase();
      if (stats.mounts.includes(name)) {
        updateStats({ activeMount: name, activeVehicle: '' });
        addLog(`You mount the ${name}.`);
      } else {
        addLog('You do not have that mount.');
      }
    } else if (parsed.type === 'dismount') {
      if (stats.activeMount) {
        addLog(`You dismount the ${stats.activeMount}.`);
        updateStats({ activeMount: '' });
      } else {
        addLog('You are not mounted.');
      }
    } else if (parsed.type === 'board') {
      const name = parsed.arg.toLowerCase();
      if (stats.vehicles.includes(name)) {
        updateStats({ activeVehicle: name, activeMount: '' });
        addLog(`You board the ${name}.`);
      } else {
        addLog('You do not have that vehicle.');
      }
    } else if (parsed.type === 'disembark') {
      if (stats.activeVehicle) {
        addLog(`You leave the ${stats.activeVehicle}.`);
        updateStats({ activeVehicle: '' });
      } else {
        addLog('You are not in a vehicle.');
      }
    } else if (parsed.type === 'teleport') {
      const [xStr, yStr] = parsed.args;
      const x = parseInt(xStr, 10);
      const y = parseInt(yStr, 10);
      if (isNaN(x) || isNaN(y)) {
        addLog('Usage: teleport <x> <y>');
      } else if (stats.teleportScrolls > 0) {
        updateStats({ teleportScrolls: stats.teleportScrolls - 1 });
        setPosition({ x, y });
        addLog(`You teleport to ${x}, ${y}.`);
      } else {
        addLog('You have no teleport scrolls.');
      }
    } else if (parsed.type === 'acquire') {
      const item = parsed.arg.toLowerCase();
      if (item === 'horse') {
        if (!stats.mounts.includes('horse')) updateStats({ mounts: [...stats.mounts, 'horse'] });
        addLog('You acquire a horse.');
      } else if (item === 'cart') {
        if (!stats.vehicles.includes('cart')) updateStats({ vehicles: [...stats.vehicles, 'cart'] });
        addLog('You acquire a cart.');
      } else if (item === 'teleport scroll') {
        updateStats({ teleportScrolls: (stats.teleportScrolls || 0) + 1 });
        addLog('You acquire a teleport scroll.');
      } else {
        addLog('Unknown acquisition.');
      }
    } else if (parsed.type === 'look') {
      const place = places[`${position.x},${position.y}`];
      addLog(`You look around. ${place.description}`);
    } else if (parsed.type === 'stats') {
      addLog(`HP: ${stats.health} | Class: ${stats.class || 'None'} | Position: ${position.x}, ${position.y}`);
    } else if (parsed.type === 'save') {
      saveGame();
      addLog('Game saved.');
    } else if (parsed.type === 'load') {
      loadGame().then(() => addLog('Game loaded.')).catch(() => addLog('Failed to load.'));
    } else if (parsed.type === 'fight') {
      const key = `${position.x},${position.y}`;
      const enc = encounters[key];
      if (enc && enc.type === 'enemy') {
        addLog(`You defeat the ${enc.name}!`);
        setEncounters({ ...encounters, [key]: null });
        const gain = Math.floor(Math.random() * 5) + 1;
        updateStats({ coins: stats.coins + gain });
        addLog(`You loot ${gain} coins from the ${enc.name}.`);
      } else {
        addLog('There is nothing to fight here.');
      }
    } else if (parsed.type === 'search') {
      fetch('/item', { method: 'POST', headers: { 'Content-Type': 'application/json' } })
        .then((r) => (r.ok ? r.json() : Promise.reject()))
        .then((item) => {
          const newWeight = stats.weight + (item.weight || 1);
          addLog(`You found ${item.name}! ${item.description} (Weight ${item.weight || 1})`);
          updateStats({ items: [...stats.items, item], weight: newWeight });
          if (newWeight > getMaxWeight()) {
            addLog('You are encumbered by the weight of your items.');
          }
          const coins = Math.floor(Math.random() * 3);
          if (coins > 0) {
            updateStats({ coins: stats.coins + coins });
            addLog(`You also found ${coins} coins.`);
          }
        })
        .catch(() => addLog('You search but find nothing.'));
    } else if (parsed.type === 'drop') {
      const name = parsed.arg;
      const idx = stats.items.findIndex((it) => {
        const itemName = typeof it === 'string' ? it : it.name;
        return itemName.toLowerCase() === name.toLowerCase();
      });
      if (idx >= 0) {
        const item = stats.items[idx];
        const weight = typeof item === 'object' ? (item.weight || 1) : 0;
        const newItems = [...stats.items];
        newItems.splice(idx, 1);
        const newWeight = Math.max(0, stats.weight - weight);
        updateStats({ items: newItems, weight: newWeight });
        addLog(`You drop the ${typeof item === 'string' ? item : item.name}.`);
      } else {
        addLog('You do not have that item.');
      }
    } else if (parsed.type === 'gather') {
      const res = baseResources[Math.floor(Math.random() * baseResources.length)];
      const rare = res === 'gorgonite';
      const amt = rare ? (Math.random() < 0.05 ? 1 : 0) : Math.floor(Math.random() * 3) + 1;
      if (amt > 0) {
        const newRes = { ...stats.resources };
        newRes[res] = (newRes[res] || 0) + amt;
        updateStats({ resources: newRes });
        addLog(`You gather ${amt} ${res}.`);
      } else {
        addLog('You search but find no useful materials.');
      }
    } else if (parsed.type === 'discover') {
      fetch('/resource', { method: 'POST', headers: { 'Content-Type': 'application/json' } })
        .then((r) => (r.ok ? r.json() : Promise.reject()))
        .then((d) => {
          const name = d.name.toLowerCase();
          addLog(`You discover a new resource: ${name}.`);
          const newRes = { ...stats.resources };
          if (!newRes.discovered[name]) newRes.discovered[name] = 0;
          updateStats({ resources: newRes });
        })
        .catch(() => addLog('No new resources discovered.'));
    } else if (parsed.type === 'buff') {
      const [stat, valStr, durStr] = parsed.args;
      const value = parseInt(valStr, 10);
      const duration = parseInt(durStr, 10) || 1;
      if (!stat || isNaN(value)) {
        addLog('Usage: buff <stat> <value> <duration>');
      } else {
        applyBuffEffect({ name: `${stat}-buff`, stat, value, duration });
        addLog(`Buff applied to ${stat} (+${value}) for ${duration}h.`);
      }
    } else if (parsed.type === 'debuff') {
      const [stat, valStr, durStr] = parsed.args;
      const value = parseInt(valStr, 10);
      const duration = parseInt(durStr, 10) || 1;
      if (!stat || isNaN(value)) {
        addLog('Usage: debuff <stat> <value> <duration>');
      } else {
        applyBuffEffect({ name: `${stat}-debuff`, stat, value: -value, duration });
        addLog(`Debuff applied to ${stat} (-${value}) for ${duration}h.`);
      }
    } else if (parsed.type === 'poison') {
      const [dmgStr, durStr] = parsed.args;
      const damage = parseInt(dmgStr, 10);
      const duration = parseInt(durStr, 10) || 1;
      if (isNaN(damage)) {
        addLog('Usage: poison <damage> <duration>');
      } else {
        addStatusEffect({ name: 'poison', damage, duration });
        addLog(`You are poisoned for ${duration}h.`);
      }
    } else if (parsed.type === 'status') {
      if (stats.buffs && stats.buffs.length > 0) {
        stats.buffs.forEach((b) => addLog(`${b.name} on ${b.stat} x${b.stacks} (${b.duration}h)`));
      } else {
        addLog('No active buffs.');
      }
      if (stats.statusEffects && stats.statusEffects.length > 0) {
        stats.statusEffects.forEach((s) => {
          if (s.name === 'poison') addLog(`Poison ${s.damage}/h (${s.duration}h)`);
          else addLog(`${s.name} (${s.duration}h)`);
        });
      } else {
        addLog('No status effects.');
      }
    } else if (parsed.type === 'use' && parsed.arg === 'gorgonite') {
      if (stats.resources.gorgonite > 0) {
        fetch('/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: 'Create a unique ability name for a fantasy hero' }),
        })
          .then((r) => (r.ok ? r.json() : Promise.reject()))
          .then((d) => {
            const abilityName = d[0]?.generated_text?.split('\n')[0] || 'Mysterious Power';
            return fetch('/ai', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ prompt: `Describe the ability "${abilityName}" in one short sentence.` })
            })
              .then((r2) => (r2.ok ? r2.json() : Promise.reject()))
              .then((d2) => {
                const desc = d2[0]?.generated_text?.split('\n')[0] || '';
                const newRes = { ...stats.resources, gorgonite: stats.resources.gorgonite - 1 };
                updateStats({ resources: newRes, abilities: [...stats.abilities, { name: abilityName, description: desc }] });
                addLog(`The Gorgonite grants you the ability: ${abilityName}.`);
              });
          })
          .catch(() => {
            const ability = { name: `Mystic Power ${Date.now()}`, description: '' };
            const newRes = { ...stats.resources, gorgonite: stats.resources.gorgonite - 1 };
            updateStats({ resources: newRes, abilities: [...stats.abilities, ability] });
            addLog(`The Gorgonite grants you a mysterious power: ${ability.name}.`);
          });
      } else {
        addLog('You have no Gorgonite.');
      }
    } else if (parsed.type === 'ability') {
      const name = parsed.arg;
      const ab = (stats.abilities || []).find((a) => {
        if (typeof a === 'string') return a.toLowerCase() === name;
        return a.name.toLowerCase() === name;
      });
      if (ab) {
        const desc = typeof ab === 'string' ? '' : ab.description || '';
        addLog(`You use ${typeof ab === 'string' ? ab : ab.name}! ${desc}`);
      } else {
        addLog('You do not possess that ability.');
      }
    } else if (parsed.type === 'reputation' || parsed.type === 'rep') {
      if (parsed.args.length >= 2) {
        const [category, ...rest] = parsed.args;
        const name = rest.join(' ');
        const rep = stats.reputation?.[category]?.[name];
        if (rep !== undefined) addLog(`${name} (${category}) reputation: ${rep}`);
        else addLog('No reputation record.');
      } else {
        let has = false;
        Object.entries(stats.reputation || {}).forEach(([cat, list]) => {
          Object.entries(list || {}).forEach(([n, r]) => {
            addLog(`${cat.slice(0, -1)} ${n}: ${r}`);
            has = true;
          });
        });
        if (!has) addLog('No reputation with any group.');
      }
    } else if (parsed.type === 'gainrep') {
      const [category, name, amtStr] = parsed.args;
      const amt = parseInt(amtStr, 10) || 1;
      if (!category || !name) {
        addLog('Usage: gainrep <category> <name> <amount>');
      } else {
        const cat = stats.reputation[category] || {};
        const newVal = (cat[name] || 0) + amt;
        updateStats({ reputation: { [category]: { [name]: newVal } } });
        addLog(`Reputation with ${name} (${category}) increased to ${newVal}.`);
      }
    } else if (parsed.type === 'loserep') {
      const [category, name, amtStr] = parsed.args;
      const amt = parseInt(amtStr, 10) || 1;
      if (!category || !name) {
        addLog('Usage: loserep <category> <name> <amount>');
      } else {
        const cat = stats.reputation[category] || {};
        const newVal = (cat[name] || 0) - amt;
        updateStats({ reputation: { [category]: { [name]: newVal } } });
        addLog(`Reputation with ${name} (${category}) decreased to ${newVal}.`);
      }
    } else if (parsed.type === 'spend') {
      const amt = parseInt(parsed.arg, 10);
      if (isNaN(amt) || amt <= 0) {
        addLog('Invalid amount.');
      } else if (stats.coins < amt) {
        addLog('Not enough coins.');
      } else {
        updateStats({ coins: stats.coins - amt });
        addLog(`You spend ${amt} coins.`);
      }
    } else if (parsed.type === 'ai') {
      const prompt = parsed.arg;
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
    } else if (parsed.type) {
      addLog('Unknown command.');
    }

    incrementGameTime(1);
    inputRef.current?.focus();
  }

  return (
    <Flex align="flex-start" gap="md" p="md" direction={isMobile ? 'column' : 'row'}>
      <Stack spacing="xs" style={{ flexGrow: 1 }}>
        <Paper shadow="xs" p="md" style={{ height: '300px', overflowY: 'auto' }} ref={logRef}>
          {log.map((entry, idx) => (
            <Text key={idx}>{entry}</Text>
          ))}
        </Paper>
        <TextInput
          ref={inputRef}
          placeholder="Enter command"
          value={command}
          onChange={(e) => setCommand(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleCommand();
          }}
        />
        <Button onClick={handleCommand}>Submit</Button>
      </Stack>
      <StatsCard stats={stats} />
    </Flex>
  );
};

export default Game;
