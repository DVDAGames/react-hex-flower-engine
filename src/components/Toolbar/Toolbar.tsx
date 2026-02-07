import { Group, Button, Select, Switch, ActionIcon, Menu, Tooltip } from "@mantine/core";
import { Dices, Shuffle, RotateCcw, Settings, Moon, Sun, Monitor, PenTool, Flower2 } from "lucide-react";
import { useMantineColorScheme } from "@mantine/core";
import { Link } from "react-router-dom";
import Roller from "@dvdagames/js-die-roller";
import type { EngineDefinition } from "@/types/engine";
import { useAccessMode } from "@/contexts";
import { ACTIONS, RANDOM_HEX_ROLL, type ActionType } from "@/constants";
import { UserMenu } from "@/components/Auth";
import classes from "./Toolbar.module.css";

// Helper to extract a single number from Roller result total
// (total can be number[] for complex notations or certain methods)
const getTotalAsNumber = (total: number | number[] | undefined): number => {
  if (total === undefined) return 0;
  if (Array.isArray(total)) return total[0] ?? 0;
  return total;
};

interface RollResult {
  type: ActionType;
  total: number;
}

interface ToolbarProps {
  engines: EngineDefinition[];
  currentEngine: EngineDefinition;
  setCurrentEngine: (engine: EngineDefinition) => void;
  setActiveHex: (hex: number) => void;
  setRoll: (roll: RollResult | null) => void;
  showAnnotations: boolean;
  setShowAnnotations: (show: boolean) => void;
}

export function Toolbar({
  engines,
  currentEngine,
  setCurrentEngine,
  setActiveHex,
  setRoll,
  showAnnotations,
  setShowAnnotations,
}: ToolbarProps) {
  const { mode } = useAccessMode();
  const { colorScheme, setColorScheme } = useMantineColorScheme();

  const runEngine = () => {
    try {
      // Use the engine's roll configuration - pass notation to constructor
      const roller = new Roller(currentEngine.roll);
      setRoll({ type: ACTIONS.RUN, total: getTotalAsNumber(roller.result?.total) });
    } catch (error) {
      console.error("Roll failed:", error);
    }
  };

  const randomHex = () => {
    try {
      const roller = new Roller(RANDOM_HEX_ROLL);
      setRoll({ type: ACTIONS.RANDOM, total: getTotalAsNumber(roller.result?.total) });
    } catch (error) {
      console.error("Random roll failed:", error);
    }
  };

  const restartEngine = () => {
    setActiveHex(currentEngine.start);
    setRoll(null);
  };

  const handleEngineChange = (value: string | null) => {
    if (!value) return;
    const engine = engines.find((e) => e.name === value);
    if (engine) {
      setCurrentEngine(engine);
    }
  };

  const engineOptions = engines.map((engine) => ({
    value: engine.name,
    label: engine.name,
  }));

  const colorSchemeIcon = {
    light: <Sun size={16} />,
    dark: <Moon size={16} />,
    auto: <Monitor size={16} />,
  };

  return (
    <nav className={classes.toolbar}>
      <Group gap="sm" wrap="wrap" justify="center">
        {/* Engine Controls - Always available */}
        <Group gap="xs">
          <Tooltip label={`Roll ${currentEngine.roll}`}>
            <Button onClick={runEngine} leftSection={<Dices size={18} />} variant="filled">
              Run Engine
            </Button>
          </Tooltip>

          <Tooltip label="Jump to random hex (1d19)">
            <Button onClick={randomHex} leftSection={<Shuffle size={18} />} variant="light">
              Random
            </Button>
          </Tooltip>

          <Tooltip label="Return to starting position">
            <ActionIcon onClick={restartEngine} variant="subtle" size="lg" aria-label="Restart engine">
              <RotateCcw size={18} />
            </ActionIcon>
          </Tooltip>
        </Group>

        {/* Show annotations toggle */}
        <Switch label="Show Roll Map" checked={showAnnotations} onChange={(e) => setShowAnnotations(e.currentTarget.checked)} />

        {/* Engine selector - hidden in readonly mode */}
        {mode !== "readonly" && (
          <Select
            value={currentEngine.name}
            onChange={handleEngineChange}
            data={engineOptions}
            placeholder="Select engine"
            w={180}
            aria-label="Select hex flower engine"
          />
        )}

        {/* Settings menu */}
        <Menu shadow="md" width={200}>
          <Menu.Target>
            <ActionIcon variant="subtle" size="lg" aria-label="Settings">
              <Settings size={18} />
            </ActionIcon>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Label>Navigation</Menu.Label>
            <Menu.Item
              leftSection={<PenTool size={16} />}
              component={Link}
              to="/editor"
            >
              Engine Editor
            </Menu.Item>
            <Menu.Item
              leftSection={<Flower2 size={16} />}
              component={Link}
              to="/gallery"
            >
              The Garden
            </Menu.Item>

            <Menu.Divider />

            <Menu.Label>Appearance</Menu.Label>
            <Menu.Item
              leftSection={colorSchemeIcon.light}
              onClick={() => setColorScheme("light")}
              disabled={colorScheme === "light"}
            >
              Light mode
            </Menu.Item>
            <Menu.Item
              leftSection={colorSchemeIcon.dark}
              onClick={() => setColorScheme("dark")}
              disabled={colorScheme === "dark"}
            >
              Dark mode
            </Menu.Item>
            <Menu.Item
              leftSection={colorSchemeIcon.auto}
              onClick={() => setColorScheme("auto")}
              disabled={colorScheme === "auto"}
            >
              System default
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>

        {/* User menu */}
        <UserMenu />
      </Group>

      {/* Readonly indicator */}
      {mode === "readonly" && <div className={classes.readonlyBadge}>👁️ View Only</div>}
    </nav>
  );
}

export default Toolbar;
