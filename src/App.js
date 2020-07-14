import React, { useState, useEffect } from "react";

import Grid from "./components/Grid";

import Toolbar from "./components/Toolbar";

import makeStorageKey from "./utilities/make-key";

import Store from "./utilities/storage";

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

      if (currentEngine?.active) {
        setActiveHex(currentEngine.active);
      } else {
        setActiveHex(currentEngine.start);
      }
    }
  }, [currentEngine?.id]);

  useEffect(() => {
    if (currentEngine) {
      setCurrentEngine({ ...currentEngine, active: activeHex });
    }
  }, [activeHex]);

  useEffect(() => {
    if (currentEngine?.active) {
      Store.set(makeStorageKey(currentEngine.id), currentEngine.active);
    }
  }, [currentEngine?.active]);

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

  return (
    <>
      {roll ? (
        <section className={styles.roll}>
          <p>{roll.total}</p>
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
          />
        ) : (
          <></>
        )}
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
