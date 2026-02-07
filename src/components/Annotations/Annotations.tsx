import { useMemo } from "react";
import { Box } from "@mantine/core";
import type { EngineDefinition, Direction, RollDirection } from "@/types/engine";
import { DIRECTION_ORDER } from "@/constants";
import classes from "./Annotations.module.css";

interface AnnotationsProps {
  engine: EngineDefinition;
}

/**
 * Collate roll values by direction for display
 * Note: 'stay' directions are filtered out as they don't need annotation arrows
 */
function collateDirections(directions: Record<number, RollDirection>): Partial<Record<Direction, number[]>> {
  const result: Partial<Record<Direction, number[]>> = {};

  for (const [rollValue, direction] of Object.entries(directions)) {
    // Skip 'stay' directions - they don't have arrow annotations
    if (direction === "stay") continue;

    const roll = parseInt(rollValue, 10);
    if (!result[direction]) {
      result[direction] = [];
    }
    result[direction]!.push(roll);
  }

  // Sort each direction's values
  for (const direction of Object.keys(result) as Direction[]) {
    result[direction]!.sort((a, b) => a - b);
  }

  return result;
}

export function Annotations({ engine }: AnnotationsProps) {
  const collatedDirections = useMemo(() => collateDirections(engine.directions), [engine.directions]);

  return (
    <Box component="aside" className={classes.annotations}>
      <h3 className="visually-hidden">Roll values and their directions</h3>
      <ol className={classes.directionList}>
        {DIRECTION_ORDER.map((direction) => {
          const values = collatedDirections[direction];
          if (!values || values.length === 0) return null;

          return (
            <li key={`direction-${direction}`} className={`${classes.direction} ${classes[direction]}`}>
              <span className="visually-hidden">
                Rolling {values.join(" or ")} moves you {direction}.
              </span>
              <span aria-hidden="true">{values.join(",")}</span>
            </li>
          );
        })}
      </ol>
    </Box>
  );
}

export default Annotations;
