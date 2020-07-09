import React from "react";

import styles from "./Hex.module.scss";

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
    hexClasses.push(styles.activeHex);
    containerClasses.push(styles.highlightedHex);
  }

  if (highlighted) {
    containerClasses.push(styles.highlightedHex);
  }

  return (
    <button
      onClick={onClick}
      className={containerClasses.join(" ")}
      disabled={active}
    >
      <div className={hexClasses.join(" ")}>{hex.id}</div>
    </button>
  );
};
