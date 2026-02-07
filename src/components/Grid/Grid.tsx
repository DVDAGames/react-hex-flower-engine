import { useMemo } from "react";
import { Box } from "@mantine/core";
import type { EngineDefinition, HexNode } from "@/types/engine";
import { Hex } from "@/components/Hex";
import classes from "./Grid.module.css";

interface GridProps {
  engine: EngineDefinition;
  activeHex: number;
  setActiveHex: (id: number) => void;
  showAnnotations: boolean;
}

export function Grid({ engine, activeHex, setActiveHex, showAnnotations }: GridProps) {
  const activeNode = engine.nodes.find(({ id }) => id === activeHex);

  const highlightedHexes = useMemo(() => {
    if (!activeNode?.map) return new Set<number>();
    return new Set(Object.values(activeNode.map));
  }, [activeNode]);

  const handleHexClick = (hex: HexNode) => {
    setActiveHex(hex.id);
  };

  return (
    <Box component="article">
      <ol className={classes.grid}>
        {engine.nodes.map((hex) => (
          <Hex
            key={`hex-${hex.id}`}
            hex={hex}
            onHexClick={() => handleHexClick(hex)}
            isActive={hex.id === activeHex}
            isHighlighted={highlightedHexes.has(hex.id)}
            showAnnotations={hex.id === activeHex && showAnnotations}
            engine={engine}
          />
        ))}
      </ol>
    </Box>
  );
}

export default Grid;
