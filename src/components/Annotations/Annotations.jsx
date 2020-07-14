import React, { useState, useEffect } from "react";

import styles from "./Annotations.module.scss";

export const Annotations = ({ engine }) => {
  const [collatedDirectionRolls, setCollatedDirectionRolls] = useState();

  useEffect(() => {
    setCollatedDirectionRolls(
      Object.keys(engine.directions).reduce((collationObject, rollValue) => {
        const direction = engine.directions[rollValue];

        if (Object.prototype.hasOwnProperty.call(collationObject, direction)) {
          collationObject[direction] = [
            ...collationObject[direction],
            rollValue,
          ].sort((a, b) => a - b);
        } else {
          collationObject[direction] = [rollValue];
        }

        return collationObject;
      }, {})
    );
  }, [JSON.stringify(engine.directions)]);

  const renderDirectionAnnotations = () =>
    Object.keys(collatedDirectionRolls).map((direction) => {
      return (
        <li
          className={styles[direction]}
          key={`direction-annotation-${direction}`}
        >
          {collatedDirectionRolls[direction].join(",")}
        </li>
      );
    });

  return (
    <aside className={styles.annotations}>
      {collatedDirectionRolls ? (
        <ol className={styles.directionList}>{renderDirectionAnnotations()}</ol>
      ) : (
        <></>
      )}
    </aside>
  );
};
