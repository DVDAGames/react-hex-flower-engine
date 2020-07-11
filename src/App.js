import React, { useState, useEffect } from "react";

import Grid from "./components/Grid";

import Toolbar from "./components/Toolbar";

import Store from "./utilities/storage";

import checkEngineVersion from "./utilities/check-version";

import {
  LOCAL_STORAGE_ENGINE_KEY,
  LOCAL_STORAGE_CURRENT_ENGINE_KEY,
  LOCAL_STORAGE_ENGINE_STORE_KEY,
  ROLL_DELAY,
  ACTIONS,
  DEFAULT_STARTING_HEX,
  DEFAULT_ENGINE_STORE,
} from "./constants";

import styles from "./App.module.scss";

export const App = () => {
  const [currentEngine, setCurrentEngine] = useState(null);

  const [activeHex, setActiveHex] = useState(null);

  const [roll, setRoll] = useState(null);

  const [engines, setEngines] = useState([]);

  const [rollDisplayTimeout, setRollDisplayTimeout] = useState();

  /* eslint-disable react-hooks/exhaustive-deps*/
  useEffect(() => {
    const engine = Store.get(LOCAL_STORAGE_CURRENT_ENGINE_KEY);

    const engineStore = Store.get(LOCAL_STORAGE_ENGINE_STORE_KEY);

    if (Array.isArray(engineStore) && engineStore.length) {
      const versionedEngineStore = engineStore.map((engineStoreItem) => {
        const defaultEngine = DEFAULT_ENGINE_STORE.find(
          ({ id }) => id === engineStoreItem.id
        );

        if (
          checkEngineVersion(defaultEngine.version, engineStoreItem.version)
        ) {
          return defaultEngine;
        }

        return engineStoreItem;
      });

      Store.set(LOCAL_STORAGE_ENGINE_STORE_KEY, versionedEngineStore);

      setEngines(versionedEngineStore);
    } else {
      setEngines(DEFAULT_ENGINE_STORE);

      Store.set(LOCAL_STORAGE_ENGINE_STORE_KEY, DEFAULT_ENGINE_STORE);
    }

    if (engine?.id) {
      setCurrentEngine(engine);
    } else {
      setCurrentEngine(DEFAULT_ENGINE_STORE[0]);
    }
  }, []);

  useEffect(() => {
    engines.forEach((engineStoreItem) => {
      const engineKey = `${LOCAL_STORAGE_ENGINE_KEY}_${engineStoreItem.id}`;

      const storedEngine = Store.get(engineKey);

      if (
        !storedEngine?.id ||
        checkEngineVersion(engineStoreItem.version, storedEngine.version)
      ) {
        const defaultEngine = DEFAULT_ENGINE_STORE.find(
          ({ id }) => id === engineStoreItem.id
        );

        Store.set(engineKey, {
          ...defaultEngine,
          ...engineStoreItem,
          active: storedEngine?.active
            ? storedEngine.active
            : defaultEngine?.start
            ? defaultEngine.start
            : DEFAULT_STARTING_HEX,
        });
      }
    });
  }, [engines.length]);

  useEffect(() => {
    if (currentEngine?.id) {
      Store.set(LOCAL_STORAGE_CURRENT_ENGINE_KEY, currentEngine);

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
      Store.set(
        `${LOCAL_STORAGE_ENGINE_KEY}_${currentEngine.id}`,
        currentEngine
      );

      Store.set(LOCAL_STORAGE_CURRENT_ENGINE_KEY, currentEngine);
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
  /* eslint-enable react-hooks/exhaustive-deps*/

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
