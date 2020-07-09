import React from "react";

import Roller from "@dvdagames/js-die-roller";

import {
  RUN_ENGINE_ROLL,
  RANDOM_HEX_ROLL,
  ACTIONS,
  LOCAL_STORAGE_ENGINE_KEY,
} from "../../constants";

import styles from "./Toolbar.module.scss";

export const Toolbar = ({
  setRoll,
  currentRoll,
  engines,
  currentEngine,
  setCurrentEngine,
}) => {
  const runEngine = () => {
    if (typeof setRoll === "function") {
      try {
        const {
          result: { total },
        } = new Roller(RUN_ENGINE_ROLL);

        const type = ACTIONS.RUN;

        setRoll({ type, total });
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

        const type = ACTIONS.RANDOM;

        setRoll({ type, total });
      } catch (e) {
        console.error(e);
      }
    }
  };

  const renderEngineOptions = () => {
    return engines.map(({ id, name }) => {
      return (
        <option key={`engine-${id}`} value={id}>
          {name}
        </option>
      );
    });
  };

  const onChooseEngine = (e) => {
    const engineId = e.target.value;

    const storedEngine = JSON.parse(
      localStorage.getItem(`${LOCAL_STORAGE_ENGINE_KEY}_${engineId}`)
    );

    if (storedEngine?.id) {
      setCurrentEngine(storedEngine);
    }
  };

  return (
    <nav className={styles.toolbar}>
      <ul className={styles.list}>
        <li className={styles.listItem}>
          <button onClick={runEngine} disabled={currentRoll}>
            Run Engine (2d6)
          </button>
        </li>
        <li className={styles.listItem}>
          <button onClick={randomHex} disabled={currentRoll}>
            Random (1d19)
          </button>
        </li>
        <li className={styles.listItem}>
          <label htmlFor="choose-engine">Engine</label>
          <select
            id="choose-engine"
            onChange={onChooseEngine}
            disabled={engines.length < 2}
            value={currentEngine.id}
          >
            {renderEngineOptions()}
          </select>
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
