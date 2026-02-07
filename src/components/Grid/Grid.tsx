import { useMemo } from "react";
import { Box } from "@mantine/core";
import type { EngineDefinition, HexNode } from "@/types/engine";
import { Hex } from "@/components/Hex";
import classes from "./Grid.module.css";

/**
 * Hex flower layout - 19 hexes arranged in rows from top to bottom:
 * Row 1: 19 (top point)
 * Row 2: 17, 18
 * Row 3: 14, 15, 16
 * Row 4: 12, 13
 * Row 5: 9, 10, 11
 * Row 6: 7, 8
 * Row 7: 4, 5, 6
 * Row 8: 2, 3
 * Row 9: 1 (bottom point)
 */
const HEX_ROWS: number[][] = [[19], [17, 18], [14, 15, 16], [12, 13], [9, 10, 11], [7, 8], [4, 5, 6], [2, 3], [1]];

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

  // Create a map from hex id to hex node for quick lookup
  const hexMap = useMemo(() => {
    const map = new Map<number, HexNode>();
    engine.nodes.forEach((hex) => map.set(hex.id, hex));
    return map;
  }, [engine.nodes]);

  const handleHexClick = (hex: HexNode) => {
    setActiveHex(hex.id);
  };

  return (
    <Box component="article">
      <div className={classes.grid}>
        {HEX_ROWS.map((row, rowIndex) => (
          <div key={`row-${rowIndex}`} className={classes.row}>
            {row.map((hexId) => {
              const hex = hexMap.get(hexId);
              if (!hex) return null;
              return (
                <Hex
                  key={`hex-${hex.id}`}
                  hex={hex}
                  onHexClick={() => handleHexClick(hex)}
                  isActive={hex.id === activeHex}
                  isHighlighted={highlightedHexes.has(hex.id)}
                  showAnnotations={hex.id === activeHex && showAnnotations}
                  engine={engine}
                />
              );
            })}
          </div>
        ))}
      </div>
    </Box>
  );
}

export default Grid;
