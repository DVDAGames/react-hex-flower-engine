import { Container, Image, Text, Title } from "@mantine/core";
import { PageLayout } from "../PageLayout";

export function About() {
  return (
    <PageLayout>
      <Container size="md" py="xl" mt="2xl">
        <Image src="/public/project-hex-dm.png" alt="Project Hex Dungeon Master" width="100%" height="auto" />
        <Title order={1}>About Project Hex</Title>
        <Text size="lg" mt="md">
          Project Hex is a tool for creating and sharing{" "}
          <a href="https://goblinshenchman.wordpress.com/hex-power-flower/" target="_blank" rel="noopener noreferrer">
            Hex Flower Engines
          </a>{" "}
          with your players and other Game Masters.
        </Text>
        <Text size="lg" mt="md">
          Inspired by the work of{" "}
          <a href="https://goblinshenchman.wordpress.com/" target="_blank" rel="noopener noreferrer">
            Goblin's Henchman
          </a>
          , creator of the Hex Flower Engine, Project Hex provides a user-friendly interface for building, customizing, and
          sharing your own Hex Flower Engines.
        </Text>
        <Text size="lg" mt="md">
          The project was created by{" "}
          <a href="https://dvdagames.com/" target="_blank" rel="noopener noreferrer">
            Dead Villager Dead Adventurer Games
          </a>{" "}
          for use in a homebrew Dungeons & Dragons campaign, and its source code is available on{" "}
          <a href="https://github.com/dvdagames/react-hex-flower-engine" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          . Contributions and feedback are encouraged.
        </Text>
      </Container>
    </PageLayout>
  );
}

export default About;
