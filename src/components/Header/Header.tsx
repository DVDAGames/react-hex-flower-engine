import { useState, useEffect, useMemo } from "react";
import { Group, Text, Anchor, ActionIcon, Tooltip, Menu, TextInput, Loader, ScrollArea } from "@mantine/core";
import { Link, useNavigate } from "react-router-dom";
import { useMantineColorScheme } from "@mantine/core";
import { Hexagon, Sun, Moon, Flower2, Search } from "lucide-react";
import { UserMenu } from "@/components/Auth";
import { useAuth } from "@/contexts";
import { getMyEngines, type Engine } from "@/lib/api";
import type { EngineDefinition } from "@/types/engine";
import classes from "./Header.module.css";

export function Header() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [engines, setEngines] = useState<Engine[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [menuOpened, setMenuOpened] = useState(false);

  // Load engines when menu opens
  useEffect(() => {
    if (menuOpened && isAuthenticated && engines.length === 0) {
      setIsLoading(true);
      getMyEngines().then(({ data, error }) => {
        if (data && !error) {
          setEngines(data);
        }
        setIsLoading(false);
      });
    }
  }, [menuOpened, isAuthenticated, engines.length]);

  // Filter engines based on search
  const filteredEngines = useMemo(() => {
    if (!searchQuery.trim()) return engines;
    const query = searchQuery.toLowerCase();
    return engines.filter((engine) => {
      const def = engine.definition as EngineDefinition;
      return def.name.toLowerCase().includes(query) || def.description?.toLowerCase().includes(query);
    });
  }, [engines, searchQuery]);

  const handleSelectEngine = (engineId: string) => {
    navigate(`/?engine=${engineId}`);
    setMenuOpened(false);
    setSearchQuery("");
  };

  const toggleColorScheme = () => {
    setColorScheme(colorScheme === "dark" ? "light" : "dark");
  };

  return (
    <header className={classes.header}>
      {/* Left side - Logo and Navigation */}
      <Group gap="lg">
        <Anchor component={Link} to="/" className={classes.logo} underline="never">
          <Hexagon size={24} />
          <Text fw={600} size="lg">
            Hex
          </Text>
        </Anchor>

        <nav>
          <Group gap="xs">
            <Anchor component={Link} to="/editor" className={classes.navLink} underline="never">
              Editor
            </Anchor>
            <Anchor component={Link} to="/gallery" className={classes.navLink} underline="never">
              Garden
            </Anchor>
          </Group>
        </nav>
      </Group>

      {/* Right side - My Engines dropdown, Color scheme toggle and User Menu */}
      <Group gap="sm">
        {isAuthenticated && (
          <Menu opened={menuOpened} onChange={setMenuOpened} position="bottom-end" width={280} shadow="md">
            <Menu.Target>
              <Tooltip label="My Engines">
                <ActionIcon variant="subtle" size="lg" aria-label="My Engines">
                  <Flower2 size={18} />
                </ActionIcon>
              </Tooltip>
            </Menu.Target>

            <Menu.Dropdown>
              <TextInput
                placeholder="Search engines..."
                leftSection={<Search size={14} />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.currentTarget.value)}
                size="xs"
                mx="xs"
                mt="xs"
                mb="xs"
              />

              <Menu.Divider />

              <ScrollArea.Autosize mah={300}>
                {isLoading ? (
                  <Group justify="center" py="md">
                    <Loader size="sm" />
                  </Group>
                ) : filteredEngines.length === 0 ? (
                  <Text size="sm" c="dimmed" ta="center" py="md" px="xs">
                    {engines.length === 0 ? "No saved engines yet" : "No matches found"}
                  </Text>
                ) : (
                  filteredEngines.map((engine) => {
                    const def = engine.definition as EngineDefinition;
                    return (
                      <Menu.Item key={engine.id} onClick={() => handleSelectEngine(engine.id)}>
                        <Text size="sm" fw={500} lineClamp={1}>
                          {def.name}
                        </Text>
                        {def.description && (
                          <Text size="xs" c="dimmed" lineClamp={1}>
                            {def.description}
                          </Text>
                        )}
                      </Menu.Item>
                    );
                  })
                )}
              </ScrollArea.Autosize>
            </Menu.Dropdown>
          </Menu>
        )}

        <Tooltip label={colorScheme === "dark" ? "Light mode" : "Dark mode"}>
          <ActionIcon variant="subtle" size="lg" onClick={toggleColorScheme} aria-label="Toggle color scheme">
            {colorScheme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </ActionIcon>
        </Tooltip>
        <UserMenu />
      </Group>
    </header>
  );
}

export default Header;
