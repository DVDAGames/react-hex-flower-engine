import React from "react";

import styled from "styled-components";

import Icon from "../Icon";

import Annotations from "../Annotations";

import {
  getLabel,
  getIcon,
  getBackgroundColor,
} from "../../utilities/get-hex-feature";

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

const HexCell = ({ hex, hexClasses, backgroundColor, features }) => {
  const icon = getIcon(hex.style, features);

  return (
    <StyledHexCell
      backgroundColor={backgroundColor}
      className={hexClasses.join(" ")}
    >
      {icon ? (
        <Icon icon={icon} id={hex.id} label={`${hex.id}: ${hex.label}`} />
      ) : (
        hex.id
      )}
    </StyledHexCell>
  );
};

export const Hex = ({
  hex,
  hexAction,
  engine,
  showAnnotations,
  features = {},
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
    containerClasses.push(styles.highlightedHexContainer);
    hexClasses.push(styles.highlightedHex);
  }

  return (
    <li className={styles.gridItem}>
      {showAnnotations ? <Annotations engine={engine} /> : <></>}
      <button
        onClick={onClick}
        className={containerClasses.join(" ")}
        disabled={active}
        title={getLabel(hex.style, features)}
      >
        <HexCell
          hex={hex}
          hexClasses={hexClasses}
          features={features}
          backgroundColor={
            getBackgroundColor(hex.style, features)
              ? getBackgroundColor(hex.style, features)
              : active
              ? "#68f0b0"
              : "#ccc"
          }
        />
      </button>
    </li>
  );
};
