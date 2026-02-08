import { UnstyledButton, Tooltip, Box } from "@mantine/core";
import type { HexNode } from "@/types/engine";
import { HexIcon } from "@/components/HexIcon";
import classes from "./Hex.module.css";

interface HexProps {
  hex: HexNode;
  onHexClick: () => void;
  isActive: boolean;
  isHighlighted: boolean;
}

export function Hex({ hex, onHexClick, isActive, isHighlighted }: HexProps) {
  const backgroundColor = hex.style?.backgroundColor ?? (isActive ? "#68f0b0" : "#ccc");

  const containerClasses = [classes.outline, isActive && classes.activeContainer, isHighlighted && classes.highlightedContainer]
    .filter(Boolean)
    .join(" ");

  const hexClasses = [classes.hex, isActive && classes.activeHex, isHighlighted && classes.highlightedHex]
    .filter(Boolean)
    .join(" ");
  // add blank class when hex should render empty
  const boxClasses = [hexClasses, hex.blank && classes.blank].filter(Boolean).join(" ");

  const tooltipLabel = hex.label || `Hex ${hex.id}`;

  return (
    <div className={classes.gridItem} data-hex-id={hex.id}>
      <Tooltip label={tooltipLabel} position="top" withArrow>
        <UnstyledButton onClick={onHexClick} className={containerClasses} disabled={isActive} aria-label={tooltipLabel}>
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

export default Hex;
