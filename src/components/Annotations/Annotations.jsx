import React, { useState, useEffect } from "react";

import { ROLL_DIRECTION_ORDER } from "../../constants";

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
    Object.keys(collatedDirectionRolls)
      .sort(
        (a, b) =>
          ROLL_DIRECTION_ORDER.indexOf(a) - ROLL_DIRECTION_ORDER.indexOf(b)
      )
      .map((direction) => {
        return (
          <li
            className={styles[direction]}
            key={`direction-annotation-${direction}`}
          >
            <p className="visually-hidden">
              Rolling a {collatedDirectionRolls[direction].join(" or ")} should
              move you ${direction}.
            </p>
            {collatedDirectionRolls[direction].join(",")}
          </li>
        );
      });

  return (
    <aside className={styles.annotations}>
      <h3 className="visually-hidden">
        This list explains which direction each roll will take you, it goes
        clockwise starting from the 2 o'clock position.
      </h3>
      {collatedDirectionRolls ? (
        <ol className={styles.directionList}>{renderDirectionAnnotations()}</ol>
      ) : (
        <></>
      )}
    </aside>
  );
};
