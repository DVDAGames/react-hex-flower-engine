import { useEffect, useState, useMemo, useCallback } from "react";
import { Box, Text, Paper, Title, List, Stack } from "@mantine/core";
import type { HexNode } from "@/types/engine";
import { useEditor } from "@/contexts/EditorContext";
import { EditorHex } from "./EditorHex";
import classes from "./EditorGrid.module.css";
import { Toolbar } from "../Toolbar";
import { ACTIONS, type ActionType } from "@/constants";

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
  const [selectedHex, setSelectedHex] = useState<HexNode | null>(null);

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
    [mode, actions, selectedHexId],
  );

  const handleToolbarAction = (action: ActionType, rollTotal: number) => {
    switch (action) {
      case ACTIONS.RANDOM:
        handleHexClick(hexMap.get(rollTotal)!);
        break;

      case ACTIONS.RUN:
        const direction = draft?.directions[rollTotal];

        // If direction is 'stay', don't move
        if (direction === "stay") {
          break;
        }

        const currentNode = draft?.nodes.find(({ id }) => id === selectedHexId);

        if (direction && currentNode) {
          const newNodeId = currentNode.map[direction];

          if (newNodeId) {
            handleHexClick(hexMap.get(newNodeId)!);
          }
        }

        break;

      default:
        break;
    }
  };

  useEffect(() => {
    setSelectedHex(selectedHexId !== null ? hexMap.get(selectedHexId) || null : null);
  }, [selectedHexId]);

  useEffect(() => {
    if (mode === "preview") {
      actions.selectHex(draft.start);
    } else {
      actions.selectHex(null);
    }
  }, [mode]);

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
      {mode === "preview" ? (
        <Stack mt="md" align="center">
          {selectedHex?.label && (
            <Paper p="md" radius="md" className={classes.status}>
              <Title order={2} size="h4">
                {selectedHex.label}
              </Title>

              {selectedHex.description && (
                <Text size="sm" c="dimmed" mt="xs">
                  {selectedHex.description}
                </Text>
              )}

              {selectedHex.modifiers && selectedHex.modifiers.length > 0 && (
                <List size="sm" mt="sm">
                  {selectedHex.modifiers.map((mod) => (
                    <List.Item key={mod.key}>
                      <Text component="span" fw={600}>
                        {mod.key}:
                      </Text>{" "}
                      {mod.value}
                    </List.Item>
                  ))}
                </List>
              )}
            </Paper>
          )}
          <Toolbar currentEngine={draft} onAction={handleToolbarAction} setActiveHex={(hexId) => hexMap.get(hexId)} />
        </Stack>
      ) : (
        <></>
      )}
    </Box>
  );
}

export default EditorGrid;
