import React from 'react';
import { Container, Title, Text, Button, Stack } from '@mantine/core';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <Container p="xl" ta="center">
      <Stack align="center">
        <Title order={1}>Red Knight</Title>
        <Text>Welcome to the Red Knight text adventure. Explore the world and forge your story.</Text>
        <Button component={Link} to="/Game" variant="gradient" gradient={{ from: 'orange', to: 'red', deg: 60 }}>
          Start Game
        </Button>
      </Stack>
    </Container>
  );
};

export default Home;
