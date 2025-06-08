import React from 'react';
import { Container, Grid, Button, Flex } from '@mantine/core';
import { Link } from 'react-router-dom';

const Navigation = () => {
  return (
    <nav>
      <div className="Navigation-wrapper">
        <Container fluid m={0} p={0} bg="rgba(0, 0, 0, .3)">
          <Grid className="Grid-Wrapper" justify="center" m={0} mw="100%" grow gutter="xs">
            <Grid.Col span="auto" m={0} mr={10}>
              <div className="Left-Column-Navigation">
                <Button component={Link} to="/Authentication" variant="gradient" compact gradient={{ from: 'red', to: 'orange', deg: 60 }}>
                  Log-In
                </Button>
              </div>
            </Grid.Col>

            <Grid.Col span="auto" align="center" m={0}>
              <div className="Middle-Column-Navigation">
                <Flex mih="auto" m={0} gap="xs" justify="flex-start" align="flex-start" direction="row">
                  <Button component={Link} to="/User" variant="gradient" compact gradient={{ from: 'orange', to: 'red', deg: 70 }}>
                    User
                  </Button>
                  <Button component={Link} to="/Stats" variant="gradient" compact gradient={{ from: 'red', to: 'orange', deg: 80 }}>
                    Stats
                  </Button>
                  <Button component={Link} to="/Classes" variant="gradient" compact gradient={{ from: 'orange', to: 'red', deg: 85 }}>
                    Classes
                  </Button>
                  <Button component={Link} to="/Game" variant="gradient" compact gradient={{ from: 'orange', to: 'red', deg: 90 }}>
                    Game
                  </Button>
                </Flex>
              </div>
            </Grid.Col>

            <Grid.Col span="auto" offset={4} m={0} ml={10}>
              <div className="Right-Column-Navigation">
                <Button component={Link} to="/" variant="gradient" compact gradient={{ from: 'red', to: 'orange', deg: 100 }}>
                  Home
                </Button>
              </div>
            </Grid.Col>
          </Grid>
        </Container>
      </div>
    </nav>
  );
};

export default Navigation;
