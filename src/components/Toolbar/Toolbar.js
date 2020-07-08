import React from "react";

import Roller from "@dvdagames/js-die-roller";

import styles from "./Toolbar.module.scss";

const ROLL = "sum(2d6)";

const RANDOM_START_ROLL = "1d19";

export const Toolbar = ({ setCurrentHex, setRoll, currentRoll }) => {
  const rollDice = () => {
    if (typeof setCurrentHex === "function") {
      try {
        const { result } = new Roller(ROLL);

        setRoll(result.total);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const randomStart = () => {
    if (typeof setCurrentHex === "function") {
      try {
        const { result } = new Roller(RANDOM_START_ROLL);

        setRoll(result.total[0]);
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <nav className={styles.toolbar}>
      <ul className={styles.list}>
        <li className={styles.listItem}>
          <button onClick={rollDice} disabled={currentRoll}>
            Roll
          </button>
        </li>
        <li className={styles.listItem}>
          <button onClick={randomStart} disabled={currentRoll}>
            Random Start
          </button>
        </li>
      </ul>
      {currentRoll ? <p className={styles.roll}>Roll: {currentRoll}</p> : <></>}
    </nav>
  );
};
