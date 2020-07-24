import React, { useState, useEffect } from "react";

import Grid from "./components/Grid";

import Toolbar from "./components/Toolbar";

import makeStorageKey from "./utilities/make-key";

import Store from "./utilities/storage";

import { getLabel, getModifiers } from "./utilities/get-hex-feature";

import {
  LOCAL_STORAGE_CURRENT_ENGINE_KEY,
  ROLL_DELAY,
  ACTIONS,
  DEFAULT_ENGINE_STORE,
} from "./constants";

import styles from "./App.module.scss";

export const App = () => {
  const [currentEngine, setCurrentEngine] = useState(null);

  const [activeHex, setActiveHex] = useState(null);

  const [features, setFeatures] = useState(null);

  const [activeHexInfo, setActiveHexInfo] = useState(null);

  const [roll, setRoll] = useState(null);

  const [showAnnotations, setShowAnnotations] = useState(true);

  const [engines, setEngines] = useState(DEFAULT_ENGINE_STORE);

  const [rollDisplayTimeout, setRollDisplayTimeout] = useState();

  useEffect(() => {
    const engineId = Store.get(LOCAL_STORAGE_CURRENT_ENGINE_KEY);

    const engine = DEFAULT_ENGINE_STORE.find(({ id }) => id === engineId);

    if (engine) {
      setCurrentEngine(engine);
    } else {
      setCurrentEngine(DEFAULT_ENGINE_STORE[0]);
    }
  }, []);

  useEffect(() => {
    if (currentEngine?.id) {
      Store.set(LOCAL_STORAGE_CURRENT_ENGINE_KEY, currentEngine.id);

      const storedEngine = Store.get(makeStorageKey(currentEngine.id));

      if (storedEngine) {
        const {
          activeHex: storedActiveHex,
          features: storedFeatures,
        } = Store.get(makeStorageKey(currentEngine.id));

        if (activeHex) {
          setActiveHex(storedActiveHex);
        } else {
          setActiveHex(currentEngine.start);
        }

        if (features) {
          setFeatures(storedFeatures);
        } else {
          setFeatures(currentEngine.features);
        }
      } else {
        setActiveHex(currentEngine.start);
        setFeatures(currentEngine.features);
      }
    }
  }, [currentEngine?.id]);

  useEffect(() => {
    if (currentEngine) {
      setCurrentEngine({ ...currentEngine, active: activeHex });

      setActiveHexInfo(currentEngine.nodes.find(({ id }) => id === activeHex));
    }
  }, [activeHex]);

  useEffect(() => {
    if (currentEngine) {
      setCurrentEngine({ ...currentEngine, features });
    }
  }, [features]);

  useEffect(() => {
    if (currentEngine?.active) {
      const currentStoredEngineStatus = Store.get(
        makeStorageKey(currentEngine.id)
      );

      const newStoredEngineStatus = {
        ...currentStoredEngineStatus,
        activeHex: currentEngine.active,
      };

      Store.set(makeStorageKey(currentEngine.id), newStoredEngineStatus);
    }
  }, [currentEngine?.active]);

  useEffect(() => {
    if (currentEngine?.features) {
      const currentStoredEngineStatus = Store.get(
        makeStorageKey(currentEngine.id)
      );

      const newStoredEngineStatus = {
        ...currentStoredEngineStatus,
        features: currentEngine.features,
      };

      Store.set(makeStorageKey(currentEngine.id), newStoredEngineStatus);
    }
  }, [currentEngine?.features]);

  useEffect(() => {
    if (roll?.total) {
      switch (roll.type) {
        case ACTIONS.RANDOM:
          setActiveHex(roll.total);

          break;

        case ACTIONS.RUN:
        default:
          const direction = currentEngine.directions[roll.total];

          const currentNode = currentEngine.nodes.find(
            ({ id }) => id === activeHex
          );

          if (direction && currentNode) {
            const newNodeId = currentNode.map[direction];

            if (!!newNodeId) {
              setActiveHex(newNodeId);
            }
          }
      }

      setRollDisplayTimeout(
        setTimeout(() => {
          setRoll(null);
        }, ROLL_DELAY)
      );

      return () => {
        if (rollDisplayTimeout) {
          clearTimeout(rollDisplayTimeout);
        }
      };
    }
  }, [roll]);

  const renderStatus = () => {
    if (activeHexInfo?.label) {
      return (
        <h2 className={styles.status}>
          <span className="visually-hidden">Status:</span>
          {getLabel(activeHexInfo, features)}
        </h2>
      );
    }

    return <></>;
  };

  const renderModifiers = () => {
    const renderModifier = ([stat, modifier]) => (
      <li key={`modifier-for-${stat}`}>
        <strong>{stat}</strong>: {modifier}
      </li>
    );

    if (activeHexInfo?.modifiers) {
      const modifiers = getModifiers(activeHexInfo, features);

      return (
        <div className={styles.modifiers}>
          <h3 className="visually-hidden">Modifiers:</h3>
          <ul className={styles.modifierList}>
            {Object.entries(modifiers).map(renderModifier)}
          </ul>
        </div>
      );
    }

    return <></>;
  };

  return (
    <>
      {roll ? (
        <section className={styles.roll}>
          <p>
            <span className="visually-hidden">You rolled:</span>
            {roll.total}
          </p>
        </section>
      ) : (
        <></>
      )}
      <section className={styles.container}>
        <h1 className={styles.heading}>Hex Flower Engine</h1>
        {currentEngine?.id ? (
          <Grid
            engine={currentEngine}
            setActiveHex={setActiveHex}
            activeHex={activeHex}
            showAnnotations={showAnnotations}
            features={features}
          />
        ) : (
          <></>
        )}
        <p className="visually-hidden">Active Hex: {activeHex}</p>
        {renderStatus()}
        {renderModifiers()}
      </section>
      <footer className={styles.footer}>
        {currentEngine?.id ? (
          <Toolbar
            setRoll={setRoll}
            engines={engines}
            currentEngine={currentEngine}
            setCurrentEngine={setCurrentEngine}
            setActiveHex={setActiveHex}
            showAnnotations={showAnnotations}
            setShowAnnotations={setShowAnnotations}
            features={features}
            setFeatures={setFeatures}
          />
        ) : (
          <></>
        )}
        <p>v{process.env.REACT_APP_VERSION}</p>
      </footer>
    </>
  );
};

export default App;
