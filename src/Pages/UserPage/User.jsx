import React, { useState, useEffect } from 'react';
import { TextInput, Textarea, Button, Stack, Paper, Title } from '@mantine/core';

const defaultUser = {
  name: '',
  appearance: '',
};

const User = () => {
  const [user, setUser] = useState(defaultUser);

  useEffect(() => {
    const saved = localStorage.getItem('playerUser');
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch (e) {
        /* empty */
      }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('playerUser', JSON.stringify(user));
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
      </Stack>
    </Paper>
  );
};

export default User;
