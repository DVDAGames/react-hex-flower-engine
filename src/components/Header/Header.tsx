import { useState } from "react";
import { Group, Text, Anchor, ActionIcon, Tooltip, Burger, Drawer, Stack } from "@mantine/core";
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
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Toggle My Engines modal when requested

  // Filter engines based on search
  // NOTE: My engines list is loaded by the modal itself; header delegates to modal

  const handleSelectEngine = (engineId: string) => {
    navigate(`/?engine=${engineId}`);
    setMyEnginesOpen(false);
  };

  return (
    <>
      <header className={classes.header}>
        <Group w="100%">
          {/* Left side - Logo */}
          <Anchor component={Link} to="/" className={classes.logo} underline="never">
            <Hexagon size={24} />
            <Text fw={600} size="lg">
              Project Hex
            </Text>
          </Anchor>

          {/* Desktop Navigation - hidden on mobile */}
          <nav className={classes.desktopNav}>
            <Group gap="xs">
              <Anchor component={Link} to="/editor" className={classes.navLink} underline="never">
                Editor
              </Anchor>
              <Anchor component={Link} to="/garden" className={classes.navLink} underline="never">
                Garden
              </Anchor>
              <Anchor component={Link} to="/about" className={classes.navLink} underline="never">
                About
              </Anchor>
            </Group>
          </nav>

          {/* Right side - Desktop only */}
          <Group gap="sm" ml="auto" className={classes.desktopActions}>
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
        </Group>

        {/* Hamburger menu - mobile only */}
        <Burger
          opened={drawerOpen}
          onClick={() => setDrawerOpen((o) => !o)}
          className={classes.burger}
          aria-label="Toggle navigation"
        />
      </header>

      {/* Mobile drawer */}
      <Drawer
        opened={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        position="right"
        size="xs"
        title="Navigation"
        classNames={{ header: classes.drawerHeader }}
      >
        <Stack gap="md">
          <Anchor
            component={Link}
            to="/editor"
            className={classes.drawerLink}
            underline="never"
            onClick={() => setDrawerOpen(false)}
          >
            Editor
          </Anchor>
          <Anchor
            component={Link}
            to="/garden"
            className={classes.drawerLink}
            underline="never"
            onClick={() => setDrawerOpen(false)}
          >
            Garden
          </Anchor>
          <Anchor
            component={Link}
            to="/about"
            className={classes.drawerLink}
            underline="never"
            onClick={() => setDrawerOpen(false)}
          >
            About
          </Anchor>

          {isAuthenticated && (
            <>
              <Anchor
                className={classes.drawerLink}
                underline="never"
                onClick={() => {
                  setMyEnginesOpen(true);
                  setDrawerOpen(false);
                }}
              >
                My Engines
              </Anchor>
            </>
          )}

          <div className={classes.drawerUserMenu}>
            <UserMenu />
          </div>
        </Stack>
      </Drawer>
    </>
  );
}

export default Header;
