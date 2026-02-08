import { Container, Group, Text } from "@mantine/core";

import classes from "./Footer.module.css";

export function Footer() {
  return (
    <Container fluid className={classes.footer} pt="md">
      <Group justify="center" pb="md">
        <Text size="xs" ta="center" c="dimmed">
          Hex v2.0.0
        </Text>
        <Text size="xs" ml="auto">
          a <a href="https://dvdagames.com/">Dead Villager Dead Adventurer Games</a> tool
        </Text>
      </Group>
    </Container>
  );
}

export default Footer;
