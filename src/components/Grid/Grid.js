import React from "react";

import Hex from "../Hex";

import styles from "./Grid.module.scss";

export const Grid = ({ activeHex = {}, hexAction, gridItems = [] }) => {
  const itemsToHighlight = Object.keys(activeHex.map).reduce(
    (hexArray, direction) => {
      hexArray.push(activeHex.map[direction]);

      return hexArray;
    },
    []
  );

  const renderHexes = () => {
    return gridItems.map((hex) => (
      <Hex
        key={`hex-${hex.id}`}
        hex={hex}
        hexAction={hexAction}
        active={hex.id === activeHex.id}
        highlighted={itemsToHighlight.indexOf(hex.id) > -1}
      />
    ));
  };

  return <div className={styles.grid}>{renderHexes()}</div>;
};
