import { useState } from "react";
import { Group, Text, Anchor, ActionIcon, Tooltip } from "@mantine/core";
import { Link, useNavigate } from "react-router-dom";
import { Hexagon, Icon } from "lucide-react";
import { hexagons7 } from "@lucide/lab";
import { UserMenu } from "@/components/Auth";
import { useAuth } from "@/contexts";
import { MyEnginesModal } from "@/components/Editor/MyEnginesModal";
import classes from "./Header.module.css";

export function Header() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [myEnginesOpen, setMyEnginesOpen] = useState(false);

  // Toggle My Engines modal when requested

  // Filter engines based on search
  // NOTE: My engines list is loaded by the modal itself; header delegates to modal

  const handleSelectEngine = (engineId: string) => {
    navigate(`/?engine=${engineId}`);
    setMyEnginesOpen(false);
  };

  return (
    <header className={classes.header}>
      {/* Left side - Logo and Navigation */}
      <Group gap="lg">
        <Anchor component={Link} to="/" className={classes.logo} underline="never">
          <Hexagon size={24} />
          <Text fw={600} size="lg">
            Project Hex
          </Text>
        </Anchor>

        <nav>
          <Group gap="xs">
            <Anchor component={Link} to="/editor" className={classes.navLink} underline="never">
              Editor
            </Anchor>
            <Anchor component={Link} to="/garden" className={classes.navLink} underline="never">
              Garden
            </Anchor>
            {/* Standard engine is available from My Engines modal */}
          </Group>
        </nav>
      </Group>

      {/* Right side - My Engines dropdown, Color scheme toggle and User Menu */}
      <Group gap="sm">
        {isAuthenticated && (
          <>
            <Tooltip label="My Engines">
              <ActionIcon variant="subtle" size="lg" aria-label="My Engines" onClick={() => setMyEnginesOpen(true)}>
                <Icon iconNode={hexagons7} size={18} />
              </ActionIcon>
            </Tooltip>
            <MyEnginesModal
              opened={myEnginesOpen}
              onClose={() => setMyEnginesOpen(false)}
              onLoadEngine={(_engine, id) => handleSelectEngine(id)}
            />
          </>
        )}
        <UserMenu />
      </Group>
    </header>
  );
}

export default Header;
