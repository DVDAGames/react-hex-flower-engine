import React from "react";

import Roller from "@dvdagames/js-die-roller";

import styles from "./Toolbar.module.scss";

const RUN_ENGINE_ROLL = "sum(2d6)";

const RANDOM_HEX_ROLL = "1d19";

export const Toolbar = ({ setRoll, currentRoll }) => {
  const runEngine = () => {
    if (typeof setRoll === "function") {
      try {
        const {
          result: { total },
        } = new Roller(RUN_ENGINE_ROLL);

        setRoll({ type: "RUN_ENGINE", total });
      } catch (e) {
        console.error(e);
      }
    }
  };

  const randomHex = () => {
    if (typeof setRoll === "function") {
      try {
        const {
          result: {
            total: [total],
          },
        } = new Roller(RANDOM_HEX_ROLL);

        setRoll({ type: "RANDOM_HEX", total });
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <nav className={styles.toolbar}>
      <ul className={styles.list}>
        <li className={styles.listItem}>
          <button onClick={runEngine} disabled={currentRoll}>
            Roll (2d6) & Move
          </button>
        </li>
        <li className={styles.listItem}>
          <button onClick={randomHex} disabled={currentRoll}>
            Random (1d19)
          </button>
        </li>
      </ul>
      {currentRoll ? (
        <p className={styles.roll}>Roll: {currentRoll.total}</p>
      ) : (
        <></>
      )}
    </nav>
  );
};
