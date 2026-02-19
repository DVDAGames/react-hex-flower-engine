import { Group, Button, ActionIcon, Tooltip } from "@mantine/core";
import { Dices, Shuffle, RotateCcw } from "lucide-react";
import Roller from "@dvdagames/js-die-roller";
import type { EngineDefinition } from "@/types/engine";
import { useAccessMode } from "@/contexts";
import { ACTIONS, RANDOM_HEX_ROLL, type ActionType } from "@/constants";
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
  currentEngine: EngineDefinition;
  setActiveHex: (hex: number) => void;
  setRoll?: (roll: RollResult | null) => void;
  onAction: (action: ActionType, rollTotal: number) => void;
  title?: string;
}

export function Toolbar({ currentEngine, setActiveHex, setRoll, onAction, title }: ToolbarProps) {
  const { mode } = useAccessMode();

  const runEngine = () => {
    try {
      const roller = new Roller(currentEngine.roll);
      const total = getTotalAsNumber(roller.result?.total);
      setRoll?.({ type: ACTIONS.RUN, total });
      onAction(ACTIONS.RUN, total); // Notify parent about the action
    } catch (error) {
      console.error("Roll failed:", error);
    }
  };

  const randomHex = () => {
    try {
      const roller = new Roller(RANDOM_HEX_ROLL);
      const total = getTotalAsNumber(roller.result?.total);
      setRoll?.({ type: ACTIONS.RANDOM, total });
      onAction(ACTIONS.RANDOM, total); // Notify parent about the action
    } catch (error) {
      console.error("Random roll failed:", error);
    }
  };

  const restartEngine = () => {
    setActiveHex(currentEngine.start);
    setRoll?.(null);
    onAction(ACTIONS.RANDOM, currentEngine.start); // Notify parent about the action
  };

  return (
    <nav className={classes.toolbar}>
      {title && <span className={classes.title}>{title}</span>}
      <Group gap="xs" className={classes.buttonGroup} wrap="wrap" justify="center">
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

      {/* Readonly indicator */}
      {mode === "readonly" && <div className={classes.readonlyBadge}>👁️ View Only</div>}
    </nav>
  );
}

export default Toolbar;
