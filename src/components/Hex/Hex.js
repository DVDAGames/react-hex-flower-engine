import React from "react";

import styles from "./Hex.module.scss";

export const Hex = ({ hex, hexAction, active = false }) => {
  const classes = [styles.hex];

  const onClick = () => {
    if (typeof hexAction === "function") {
      hexAction(hex);
    }
  };

  if (active) {
    classes.push(styles.activeHex);
  }

  return (
    <button onClick={onClick} className={styles.outline} disabled={active}>
      <div className={classes.join(" ")}>{hex.id}</div>
    </button>
  );
};
