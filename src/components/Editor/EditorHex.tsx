import { UnstyledButton, Tooltip, Box } from "@mantine/core";
import type { HexNode } from "@/types/engine";
import type { EditorMode } from "@/types/editor";
import { HexIcon } from "@/components/HexIcon";
import classes from "./EditorHex.module.css";

interface EditorHexProps {
  hex: HexNode;
  onHexClick: () => void;
  isSelected: boolean;
  isHighlighted: boolean;
  isStart: boolean;
  mode: EditorMode;
}

export function EditorHex({ hex, onHexClick, isSelected, isHighlighted, isStart, mode }: EditorHexProps) {
  const backgroundColor = hex.style?.backgroundColor ?? "#ccc";

  const containerClasses = [
    classes.outline,
    isSelected && classes.selectedContainer,
    isHighlighted && classes.highlightedContainer,
    mode === "preview" && classes.previewMode,
  ]
    .filter(Boolean)
    .join(" ");

  const hexClasses = [
    classes.hex,
    isSelected && classes.selectedHex,
    isHighlighted && classes.highlightedHex,
    isStart && classes.startHex,
  ]
    .filter(Boolean)
    .join(" ");
  const boxClasses = [hexClasses, hex.blank && classes.blank].filter(Boolean).join(" ");

  const tooltipLabel = hex.label || `Hex ${hex.id}`;

  return (
    <div className={classes.gridItem} data-hex-id={hex.id}>
      <Tooltip label={tooltipLabel} position="top" withArrow>
        <UnstyledButton onClick={onHexClick} className={containerClasses} aria-label={tooltipLabel}>
          <Box
            className={boxClasses}
            style={
              {
                backgroundColor,
                "--hex-bg": backgroundColor,
              } as React.CSSProperties
            }
          >
            {!hex.blank &&
              (hex.style?.icon ? (
                <HexIcon icon={hex.style.icon} label={tooltipLabel} />
              ) : (
                <span className={classes.hexId}>{hex.id}</span>
              ))}
          </Box>
        </UnstyledButton>
      </Tooltip>
    </div>
  );
}

export default EditorHex;
