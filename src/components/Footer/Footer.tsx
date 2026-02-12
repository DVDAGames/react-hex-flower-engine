import { Container, Group, Text } from "@mantine/core";

import classes from "./Footer.module.css";

export function Footer() {
  return (
    <Container fluid className={classes.footer} pt="md">
      <Group justify="end" pb="md" gap="0">
        <Text size="xs" ta="center" c="dimmed" style={{ borderRight: "1px solid #666" }} pr="xs" mr="xs">
          v2.1.0
        </Text>
        <Text size="xs" mr="0" pr="0">
          a <a href="https://dvdagames.com/">DVDA Games</a> tool inspired by{" "}
          <a href="https://goblinshenchman.wordpress.com/hex-power-flower/">Goblin's Henchman</a>
        </Text>
        <Text size="xs" c="dimmed" style={{ borderLeft: "1px solid #666" }} pl="xs" ml="xs">
          <a href="/terms">Terms of Service</a>
        </Text>
      </Group>
    </Container>
  );
}

export default Footer;
