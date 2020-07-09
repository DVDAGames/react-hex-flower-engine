import React from "react";

import Hex from "../Hex";

import styles from "./Grid.module.scss";

export const Grid = ({ engine, setActiveHex, activeHex }) => {
  const activeNode = engine.nodes.find(({ id }) => id === activeHex);

  const itemsToHighlight = activeNode?.map
    ? Object.keys(activeNode.map).reduce((hexArray, direction) => {
        hexArray.push(activeNode.map[direction]);

        return hexArray;
      }, [])
    : [];

  const renderHexes = () => {
    return engine.nodes.map((hex) => {
      const hexAction = () => {
        console.log("setting active hex:", hex.id);

        setActiveHex(hex.id);
      };

      return (
        <Hex
          key={`hex-${hex.id}`}
          hex={hex}
          hexAction={hexAction}
          active={hex.id === activeHex}
          highlighted={itemsToHighlight.indexOf(hex.id) > -1}
        />
      );
    });
  };

  return <div className={styles.grid}>{renderHexes()}</div>;
};
