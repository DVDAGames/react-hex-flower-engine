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
  DEFAULT_ENGINE,
  STANDARD_ENGINE,
} from "./constants";

import styles from "./App.module.scss";

const DEFAULT_ENGINE_STORE = [STANDARD_ENGINE, DEFAULT_ENGINE];

export const App = () => {
  const [currentEngine, setCurrentEngine] = useState(null);

  const [activeHex, setActiveHex] = useState(null);

  const [roll, setRoll] = useState(null);

  const [engines, setEngines] = useState([]);

  /* eslint-disable react-hooks/exhaustive-deps*/
  useEffect(() => {
    const engine =
      Store.get(LOCAL_STORAGE_CURRENT_ENGINE_KEY) || DEFAULT_ENGINE;

    const engineStore =
      Store.get(LOCAL_STORAGE_ENGINE_STORE_KEY) || DEFAULT_ENGINE_STORE;

    if (Array.isArray(engineStore) && engineStore.length) {
      setEngines(engineStore);
    } else {
      setEngines(DEFAULT_ENGINE_STORE);

      Storage.set(
        LOCAL_STORAGE_ENGINE_STORE_KEY,
        DEFAULT_ENGINE_STORE.map(({ id, name, version }) => ({
          id,
          name,
          version,
        }))
      );
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
        Store.set(engineKey, {
          ...engineStoreItem,
          active: storedEngine.active,
        });
      }
    });
  }, [engines.length]);

  useEffect(() => {
    if (currentEngine?.id) {
      Store.set(LOCAL_STORAGE_CURRENT_ENGINE_KEY, currentEngine);

      if (currentEngine?.activeHex) {
        setActiveHex(currentEngine.activeHex);
      } else {
        setActiveHex(currentEngine.start);
      }
    }
  }, [currentEngine?.id]);

  useEffect(() => {
    if (currentEngine?.id) {
      currentEngine.activeHex = activeHex;
    }
  }, [activeHex]);

  useEffect(() => {
    if (currentEngine?.activeHex) {
      Store.set(
        `${LOCAL_STORAGE_ENGINE_KEY}_${currentEngine.id}`,
        currentEngine
      );

      Store.set(LOCAL_STORAGE_CURRENT_ENGINE_KEY, currentEngine);
    }
  }, [currentEngine?.activeHex]);

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
            ({ id }) => id === currentEngine.activeHex
          );

          if (direction && currentNode) {
            const newNodeId = currentNode.map[direction];

            if (newNodeId) {
              setActiveHex(newNodeId);
            }
          }
      }

      setTimeout(() => {
        setRoll(null);
      }, ROLL_DELAY);
    }
  }, [roll?.total]);
  /* eslint-enable react-hooks/exhaustive-deps*/

  return (
    <>
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
      {currentEngine?.id ? (
        <Toolbar
          setRoll={setRoll}
          currentRoll={roll}
          engines={engines}
          currentEngine={currentEngine}
          setCurrentEngine={setCurrentEngine}
        />
      ) : (
        <></>
      )}
    </>
  );
};

export default App;
