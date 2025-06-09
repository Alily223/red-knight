import React from 'react';
import { Container, Button, Flex } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { Link } from 'react-router-dom';

const Navigation = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  return (
    <nav style={{ position: 'sticky', top: 0, zIndex: 1000 }}>
      <div className="Navigation-wrapper">
        <Container fluid m={0} p={0} bg="rgba(0, 0, 0, .3)">
          <Flex wrap="wrap" justify="center" align="center" gap="xs" p="xs" direction={isMobile ? 'column' : 'row'}>
            <Button component={Link} to="/Authentication" variant="gradient" compact gradient={{ from: 'red', to: 'orange', deg: 60 }}>
              Log-In
            </Button>
            <Button component={Link} to="/User" variant="gradient" compact gradient={{ from: 'orange', to: 'red', deg: 70 }}>
              User
            </Button>
            <Button component={Link} to="/Stats" variant="gradient" compact gradient={{ from: 'red', to: 'orange', deg: 80 }}>
              Stats
            </Button>
            <Button component={Link} to="/Classes" variant="gradient" compact gradient={{ from: 'orange', to: 'red', deg: 85 }}>
              Classes
            </Button>
            <Button component={Link} to="/Perks" variant="gradient" compact gradient={{ from: 'red', to: 'orange', deg: 95 }}>
              Perks
            </Button>
            <Button component={Link} to="/Game" variant="gradient" compact gradient={{ from: 'orange', to: 'red', deg: 90 }}>
              Game
            </Button>
            <Button component={Link} to="/" variant="gradient" compact gradient={{ from: 'red', to: 'orange', deg: 100 }}>
              Home
            </Button>
          </Flex>
        </Container>
      </div>
    </nav>
  );
};

export default Navigation;
