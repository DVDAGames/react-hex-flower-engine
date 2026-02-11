import { Code, Container, List, Modal, Text, Title } from "@mantine/core";

export function TermsOfService() {
  return (
    <Modal centered opened={true} onClose={() => {}} title="Hex Terms of Service" fullScreen withCloseButton={false}>
      <Container size="md">
        <Title order={2} mb="md">
          Terms of Service
        </Title>
        <Text mb="md">
          The Hex ("Hex") is a platform that enables Game Masters to share Hex Flower Engines with their players or with other
          Game Masters created by{" "}
          <a href="https://dvdagames.com" target="_blank" rel="noopener noreferrer">
            Dead Villager Dead Adventurer Games
          </a>
          ("DVDA Games"). The{" "}
          <a href="https://github.com/DVDAGames/react-hex-flower-engine" target="_blank" rel="noopener noreferrer">
            Hex project source code
          </a>{" "}
          is open source and available on GitHub under the{" "}
          <a
            href="https://github.com/DVDAGames/react-hex-flower-engine/blob/main/LICENSE"
            target="_blank"
            rel="noopener noreferrer"
          >
            GPL-3.0 License
          </a>
          . By using Hex, you agree to the following terms of service:
        </Text>
        <Text mb="md">By using Hex, you agree to the following terms:</Text>
        <List type="ordered">
          <List.Item>
            Hex may store your email address in order to associate your saved Hex Flower Engines with your account
          </List.Item>
          <List.Item>Hex may send you login links via email to authenticate your account</List.Item>
          <List.Item>
            If you opt-in to the Hex Newsletter or the Dead Village Dead Adventurer Newsletter you may receive occasional emails
            regarding new DVDA Games releases or updates to the Hex platform; we do not send emails often
          </List.Item>
          <List.Item>Hex may use cookies or local storage to save your preferences and login state</List.Item>
          <List.Item>
            Hex will not share your information with any third parties, unless we explicitly request it and you specifically
            authorize it
          </List.Item>
          <List.Item>
            Hex does not currently include any user tracking or analytics, but may add basic usage statistics in the future to
            better understand how the platform is being used and how to optimize maintenance costs and resources
          </List.Item>
          <List.Item>Hex may update these terms of service from time to time, and will notify you of any changes</List.Item>
          <List.Item>
            Hex may share any Hex Flower Engines that you choose to publish with the community; these are still your creations,
            but as other Game Masters might be relying on them for ongoing campaigns, a published Hex Flower Engine cannot be
            unpublished or deleted once it has been saved by another user
          </List.Item>
          <List.Item>
            Hex is not responsible for any content that you create or share on the platform, and you are solely responsible for
            ensuring that your content does not violate any laws or third-party rights
          </List.Item>
          <List.Item>
            Hex is provided "as is" without any warranties or guarantees, and we are not liable for any damages or losses that may
            arise from using the platform
          </List.Item>
        </List>
        <Text mt="md">
          <strong>Note:</strong> The{" "}
          <a href="https://goblinshenchman.wordpress.com/hex-power-flower/" target="_blank" rel="noopener noreferrer">
            Hex Flower Engine
          </a>{" "}
          implementation that Hex uses was orignally described by{" "}
          <a href="https://goblinshenchman.wordpress.com" target="_blank" rel="noopener noreferrer">
            Goblin's Henchman
          </a>
          . DVDAGames and the Hex project take no credit for the Hex Flower Engine system and are not affiliated with Goblin's
          Henchman, but we are grateful for the work they put into designing the system and sharing it with the world.
        </Text>
        <Text mt="md">
          Consider supporting Goblin's Henchman's work by purchasing their products on DriveThruRPG:{" "}
          <a
            href="https://www.drivethrurpg.com/en/publisher/9524/Goblin039s-Henchmanaffiliate_id%3D774882"
            target="_blank"
            rel="noopener noreferrer"
          >
            https://www.drivethrurpg.com/en/publisher/9524/Goblin039s-Henchmanaffiliate_id%3D774882
          </a>
        </Text>
        <Text mt="md">
          You may delete your account at any time, but please note that this will permanently delete all of your saved Hex Flower
          Engines and cannot be undone.{" "}
          <strong>Any Hex Flower Engines you have shared with the Community will still be available.</strong>
        </Text>
        <Text mt="md">
          If you do not agree to these terms, please do not use Hex. If you have any questions or concerns about these terms,
          please contact us: <Code>hello</Code> <Code>[at]</Code> <Code>dvdagames.com</Code>.
        </Text>
      </Container>
    </Modal>
  );
}

export default TermsOfService;
