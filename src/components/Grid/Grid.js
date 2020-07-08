import React from "react";

import Hex from "../Hex";

import styles from "./Grid.module.scss";

export const Grid = ({ activeHex = {}, hexAction, gridItems = [] }) => {
  const renderHexes = () =>
    gridItems.map((hex) => (
      <Hex
        key={`hex-${hex.id}`}
        hex={hex}
        hexAction={hexAction}
        active={hex.id === activeHex.id}
      />
    ));

  return <div className={styles.grid}>{renderHexes()}</div>;
};
