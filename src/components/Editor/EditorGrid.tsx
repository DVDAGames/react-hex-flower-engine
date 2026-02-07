import { useMemo, useCallback } from "react";
import { Box, Text } from "@mantine/core";
import type { HexNode } from "@/types/engine";
import { useEditor } from "@/contexts/EditorContext";
import { EditorHex } from "./EditorHex";
import classes from "./EditorGrid.module.css";

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

export function EditorGrid() {
  const { state, actions } = useEditor();
  const { draft, selectedHexId, mode } = state;

  // Create a map from hex id to hex node for quick lookup
  const hexMap = useMemo(() => {
    const map = new Map<number, HexNode>();
    draft.nodes.forEach((hex) => map.set(hex.id, hex));
    return map;
  }, [draft.nodes]);

  // Get highlighted hexes (neighbors of selected hex)
  const highlightedHexes = useMemo(() => {
    if (!selectedHexId) return new Set<number>();
    const selectedNode = hexMap.get(selectedHexId);
    if (!selectedNode?.map) return new Set<number>();
    return new Set(Object.values(selectedNode.map));
  }, [selectedHexId, hexMap]);

  const handleHexClick = useCallback(
    (hex: HexNode) => {
      if (mode === "preview") {
        // In preview mode, clicking navigates (would need dice roll integration)
        actions.selectHex(hex.id);
        return;
      }

      // Click selected hex again to deselect
      if (selectedHexId === hex.id) {
        actions.selectHex(null);
        return;
      }

      actions.selectHex(hex.id);
    },
    [mode, actions, selectedHexId]
  );

  return (
    <Box className={classes.container}>
      {mode === "preview" && (
        <Text size="sm" c="dimmed" ta="center" mb="md">
          Preview Mode - Click hexes to simulate navigation
        </Text>
      )}
      <div className={classes.grid}>
        {HEX_ROWS.map((row, rowIndex) => (
          <div key={`row-${rowIndex}`} className={classes.row}>
            {row.map((hexId) => {
              const hex = hexMap.get(hexId);
              if (!hex) return null;
              return (
                <EditorHex
                  key={`hex-${hex.id}`}
                  hex={hex}
                  onHexClick={() => handleHexClick(hex)}
                  isSelected={hex.id === selectedHexId}
                  isHighlighted={highlightedHexes.has(hex.id)}
                  isStart={hex.id === draft.start}
                  mode={mode}
                />
              );
            })}
          </div>
        ))}
      </div>
    </Box>
  );
}

export default EditorGrid;
