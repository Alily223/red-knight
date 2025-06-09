import React, { useState, useEffect } from 'react';
import { Paper, TextInput, Textarea, Button, Stack, Title, List, Text } from '@mantine/core';
import defaultStats from '../../defaultStats';

const defaultClass = { name: '', description: '' };

const Classes = () => {
  const [classes, setClasses] = useState(() => {
    const saved = localStorage.getItem('worldClasses');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return [];
  });
  const [form, setForm] = useState(defaultClass);
  const [currentClass, setCurrentClass] = useState('');

  useEffect(() => {
    const savedStats = localStorage.getItem('playerStats');
    if (savedStats) {
      try {
        const s = JSON.parse(savedStats);
        if (s.class) setCurrentClass(s.class);
      } catch {}
    }
  }, []);

  const saveClasses = (cls) => {
    setClasses(cls);
    localStorage.setItem('worldClasses', JSON.stringify(cls));
  };

  const handleAdd = () => {
    if (!form.name) return;
    saveClasses([...classes, form]);
    setForm(defaultClass);
  };

  const handleGenerate = () => {
    fetch('/class', { method: 'POST', headers: { 'Content-Type': 'application/json' } })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => {
        if (d.name && d.description) {
          setForm({ name: d.name, description: d.description });
        }
      })
      .catch(() => {});
  };

  const handleSelect = (cls) => {
    let stats = { ...defaultStats };
    const saved = localStorage.getItem('playerStats');
    if (saved) {
      try { stats = { ...stats, ...JSON.parse(saved) }; } catch {}
    }
    stats.class = cls.name;
    localStorage.setItem('playerStats', JSON.stringify(stats));
    setCurrentClass(cls.name);
  };

  return (
    <Paper p="md" m="md" shadow="xs">
      <Title order={2}>Classes</Title>
      {currentClass && <Text>Current Class: {currentClass}</Text>}
      <Stack>
        <TextInput label="Class Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.currentTarget.value })} />
        <Textarea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.currentTarget.value })} />
        <Button onClick={handleAdd}>Add Class</Button>
        <Button variant="outline" onClick={handleGenerate}>Generate with AI</Button>
      </Stack>
      <Title order={3} mt="md">Available Classes</Title>
      <List spacing="xs" withPadding>
        {classes.map((c, idx) => (
          <List.Item key={idx}>
            <b>{c.name}</b>: {c.description} <Button size="xs" ml="sm" onClick={() => handleSelect(c)}>Select</Button>
          </List.Item>
        ))}
      </List>
    </Paper>
  );
};

export default Classes;
