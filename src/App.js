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

  const [activeHexInfo, setActiveHexInfo] = useState(null);

  const [roll, setRoll] = useState(null);

  const [showAnnotations, setShowAnnotations] = useState(true);

  const [engines, setEngines] = useState(DEFAULT_ENGINE_STORE);

  const [rollDisplayTimeout, setRollDisplayTimeout] = useState();

  useEffect(() => {
    const engineId = Store.get(LOCAL_STORAGE_CURRENT_ENGINE_KEY);

    const engine = DEFAULT_ENGINE_STORE.find(({ id }) => id === engineId);

    setEngines(DEFAULT_ENGINE_STORE);

    if (engine) {
      setCurrentEngine(engine);
    } else {
      setCurrentEngine(DEFAULT_ENGINE_STORE[0]);
    }
  }, []);

  useEffect(() => {
    if (currentEngine?.id) {
      Store.set(LOCAL_STORAGE_CURRENT_ENGINE_KEY, currentEngine.id);

      const activeHex = Store.get(makeStorageKey(currentEngine.id));

      if (activeHex) {
        setActiveHex(activeHex);
      } else {
        setActiveHex(currentEngine.start);
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
    console.log(currentEngine?.active);

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

  const renderStatus = () => {
    if (activeHexInfo?.label) {
      return (
        <h2 className={styles.status}>
          <span className="visually-hidden">Status:</span>
          {activeHexInfo.label}
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
      return (
        <div className={styles.modifiers}>
          <h3 className="visually-hidden">Modifiers:</h3>
          <ul className={styles.modifierList}>
            {Object.entries(activeHexInfo.modifiers).map(renderModifier)}
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
