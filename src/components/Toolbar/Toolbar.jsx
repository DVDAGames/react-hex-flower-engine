import React from "react";

import Roller from "@dvdagames/js-die-roller";

import makeStorageKey from "../../utilities/make-key";

import Store from "../../utilities/storage";

import {
  RUN_ENGINE_ROLL,
  RANDOM_HEX_ROLL,
  ACTIONS,
  DEFAULT_ENGINE_STORE,
} from "../../constants";

import styles from "./Toolbar.module.scss";

export const Toolbar = ({
  setRoll,
  engines,
  currentEngine,
  setCurrentEngine,
  setActiveHex,
  showAnnotations,
  setShowAnnotations,
  features,
  setFeatures,
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

  const renderFeatureOptions = () => {
    const onFeatureChange = (e) => {
      const newFeatures = {
        ...features,
        [e.target.name]: e.target.checked,
      };

      setFeatures(newFeatures);
    };

    return Object.keys(features).map((feature) => {
      const formatFeatureLabel = () => {
        return feature
          .split(/[A-Z]/)
          .map(
            (partialString) =>
              `${partialString[0].toUpperCase()}${partialString.slice(1)}`
          )
          .join(" ");
      };

      const labelName = `feature-${feature}`;

      return (
        <li key={labelName}>
          <label htmlFor={labelName}>{formatFeatureLabel()}</label>
          <input
            type="checkbox"
            value={true}
            name={feature}
            id={labelName}
            checked={features[feature]}
            onChange={onFeatureChange}
          />
        </li>
      );
    });
  };

  const restartEngine = () => {
    setActiveHex(currentEngine.start);
  };

  const onChooseEngine = (e) => {
    const engineId = e.target.value;

    const engine = DEFAULT_ENGINE_STORE.find(({ id }) => id === engineId);

    const activeHex = Store.get(makeStorageKey(engineId)) || engine.start;

    const newEngine = {
      ...engine,
      active: activeHex,
    };

    setCurrentEngine(newEngine);

    setActiveHex(activeHex);
  };

  const onChangeAnnotations = (e) => {
    setShowAnnotations(e.target.checked);
  };

  return (
    <nav className={styles.toolbar}>
      <ul className={styles.list}>
        <li className={styles.listItem}>
          <button onClick={runEngine}>Run Engine (2d6)</button>
        </li>
        <li className={styles.listItem}>
          <button onClick={randomHex}>Random (1d19)</button>
        </li>
        <li className={styles.listItem}>
          <button onClick={restartEngine}>Restart</button>
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
        <li className={styles.listItem}>
          <label htmlFor="show-annotations">Show Roll Map</label>
          <input
            id="show-annotations"
            name="show-annotations"
            type="checkbox"
            value={1}
            checked={showAnnotations}
            onChange={onChangeAnnotations}
          />
        </li>
        <li className={styles.listItem}>
          {features ? <ul>{renderFeatureOptions()}</ul> : <></>}
        </li>
      </ul>
    </nav>
  );
};
