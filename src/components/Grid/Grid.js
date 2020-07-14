import React from "react";

import Hex from "../Hex";

import styles from "./Grid.module.scss";

export const Grid = ({ engine, setActiveHex, activeHex, showAnnotations }) => {
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
        setActiveHex(hex.id);
      };

      return (
        <Hex
          key={`hex-${hex.id}`}
          hex={hex}
          hexAction={hexAction}
          active={hex.id === activeHex}
          highlighted={itemsToHighlight.indexOf(hex.id) > -1}
          showAnnotations={hex.id === activeHex && showAnnotations}
          engine={engine}
        />
      );
    });
  };

  return (
    <article>
      <ol className={styles.grid}>{renderHexes()}</ol>
    </article>
  );
};
