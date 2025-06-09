import React, { useState, useEffect } from 'react';
import { TextInput, Textarea, Button, Stack, Paper, Title } from '@mantine/core';

const defaultUser = {
  name: '',
  appearance: '',
};

const User = () => {
  const [user, setUser] = useState(defaultUser);

  useEffect(() => {
    const saved = localStorage.getItem('gameSave');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.user) setUser(data.user);
      } catch {
        /* ignore */
      }
    } else {
      const legacy = localStorage.getItem('playerUser');
      if (legacy) {
        try { setUser(JSON.parse(legacy)); } catch {}
      }
    }
    const cred = localStorage.getItem('googleCredential');
    if (cred) {
      const { id } = JSON.parse(cred);
      fetch(`/game/load/${id}`)
        .then((r) => (r.ok ? r.json() : Promise.reject()))
        .then((d) => {
          if (d.user) setUser(d.user);
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
    state.user = user;
    state.timestamp = Date.now();
    localStorage.setItem('gameSave', JSON.stringify(state));
    localStorage.setItem('playerUser', JSON.stringify(user));
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

  const handleGenerate = () => {
    fetch('/character', { method: 'POST', headers: { 'Content-Type': 'application/json' } })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => {
        if (d.name && d.appearance) {
          setUser({ name: d.name, appearance: d.appearance });
        }
      })
      .catch(() => {});
  };

  return (
    <Paper p="md" m="md" shadow="xs">
      <Title order={2}>User Info</Title>
      <Stack>
        <TextInput label="Name" value={user.name} onChange={(e) => setUser({ ...user, name: e.currentTarget.value })} />
        <Textarea
          label="Appearance"
          value={user.appearance}
          onChange={(e) => setUser({ ...user, appearance: e.currentTarget.value })}
        />
        <Button onClick={handleSave}>Save</Button>
        <Button variant="outline" onClick={handleGenerate}>Generate with AI</Button>
      </Stack>
    </Paper>
  );
};

export default User;
