import { DEFAULT_DIRECTION_MAP as directions } from "./shared";

const id = "00000";

const name = "Standard Hex Flower Engine";

const start = 1;

const version = "1.1.0";

const nodes = [
  {
    id: 1,
    map: {
      up: 4,
      upRight: 3,
      downRight: 3,
      down: 1,
      downLeft: 2,
      upLeft: 2,
    },
  },
  {
    id: 2,
    map: {
      up: 6,
      upRight: 4,
      downRight: 1,
      down: 17,
      downLeft: 14,
      upLeft: 5,
    },
  },
  {
    id: 3,
    map: {
      up: 8,
      upRight: 7,
      downRight: 11,
      down: 18,
      downLeft: 1,
      upLeft: 4,
    },
  },
  {
    id: 4,
    map: {
      up: 9,
      upRight: 8,
      downRight: 3,
      down: 1,
      downLeft: 2,
      upLeft: 6,
    },
  },
  {
    id: 5,
    map: {
      up: 11,
      upRight: 6,
      downRight: 2,
      down: 12,
      downLeft: 15,
      upLeft: 1,
    },
  },
  {
    id: 6,
    map: {
      up: 10,
      upRight: 9,
      downRight: 4,
      down: 2,
      downLeft: 5,
      upLeft: 11,
    },
  },
  {
    id: 7,
    map: {
      up: 14,
      upRight: 1,
      downRight: 12,
      down: 15,
      downLeft: 3,
      upLeft: 8,
    },
  },
  {
    id: 8,
    map: {
      up: 13,
      upRight: 14,
      downRight: 7,
      down: 3,
      downLeft: 4,
      upLeft: 9,
    },
  },
  {
    id: 9,
    map: {
      up: 16,
      upRight: 13,
      downRight: 8,
      down: 4,
      downLeft: 6,
      upLeft: 10,
    },
  },
  {
    id: 10,
    map: {
      up: 17,
      upRight: 16,
      downRight: 9,
      down: 6,
      downLeft: 11,
      upLeft: 12,
    },
  },
  {
    id: 11,
    map: {
      up: 12,
      upRight: 10,
      downRight: 6,
      down: 5,
      downLeft: 18,
      upLeft: 3,
    },
  },
  {
    id: 12,
    map: {
      up: 5,
      upRight: 17,
      downRight: 10,
      down: 11,
      downLeft: 19,
      upLeft: 7,
    },
  },
  {
    id: 13,
    map: {
      up: 18,
      upRight: 15,
      downRight: 14,
      down: 8,
      downLeft: 9,
      upLeft: 16,
    },
  },
  {
    id: 14,
    map: {
      up: 15,
      upRight: 2,
      downRight: 17,
      down: 7,
      downLeft: 8,
      upLeft: 13,
    },
  },
  {
    id: 15,
    map: {
      up: 7,
      upRight: 5,
      downRight: 19,
      down: 14,
      downLeft: 13,
      upLeft: 18,
    },
  },
  {
    id: 16,
    map: {
      up: 19,
      upRight: 18,
      downRight: 13,
      down: 9,
      downLeft: 10,
      upLeft: 17,
    },
  },
  {
    id: 17,
    map: {
      up: 2,
      upRight: 19,
      downRight: 16,
      down: 10,
      downLeft: 12,
      upLeft: 14,
    },
  },
  {
    id: 18,
    map: {
      up: 3,
      upRight: 11,
      downRight: 15,
      down: 13,
      downLeft: 16,
      upLeft: 19,
    },
  },
  {
    id: 19,
    map: {
      up: 19,
      upRight: 19,
      downRight: 18,
      down: 16,
      downLeft: 17,
      upLeft: 19,
    },
  },
];

export default {
  id,
  name,
  directions,
  nodes,
  start,
  version,
};
