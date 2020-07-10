import React from "react";

import styled from "styled-components";

import Icon from "../Icon";

import styles from "./Hex.module.scss";

const StyledHexCell = styled.div`
  & {
    background-color: ${(props) => props.backgroundColor};

    &::before {
      border-left-color: ${(props) => props.backgroundColor};
    }

    &::after {
      border-right-color: ${(props) => props.backgroundColor};
    }
  }
`;

const HexCell = ({ hex, hexClasses, backgroundColor }) => {
  return (
    <StyledHexCell
      backgroundColor={backgroundColor}
      className={hexClasses.join(" ")}
    >
      {hex.icon ? <Icon icon={hex.icon} label={hex.label} /> : hex.id}
    </StyledHexCell>
  );
};

export const Hex = ({
  hex,
  hexAction,
  active = false,
  highlighted = false,
}) => {
  const containerClasses = [styles.outline];
  const hexClasses = [styles.hex];

  const onClick = () => {
    if (typeof hexAction === "function") {
      hexAction(hex);
    }
  };

  if (active) {
    containerClasses.push(styles.activeHexContainer);
    hexClasses.push(styles.activeHex);
  }

  if (highlighted) {
    containerClasses.push(styles.highlightedHex);
  }

  console.log(hex?.style?.backgroundColor);

  return (
    <button
      onClick={onClick}
      className={containerClasses.join(" ")}
      disabled={active}
    >
      <HexCell
        hex={hex}
        hexClasses={hexClasses}
        backgroundColor={
          hex?.style?.backgroundColor
            ? hex?.style.backgroundColor
            : active
            ? "#68f0b0"
            : "#ccc"
        }
      />
    </button>
  );
};