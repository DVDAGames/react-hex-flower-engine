import WEATHER_ENGINE from "./engines/weather";

import STANDARD_ENGINE from "./engines/standard";

import INVERSE_ENGINE from "./engines/inverse";

export const DEFAULT_ENGINE_STORE = [
  STANDARD_ENGINE,
  WEATHER_ENGINE,
  INVERSE_ENGINE,
];

export const LOCAL_STORAGE_NAMESPACE = "HEX_FLOWER_ENGINE";

export const LOCAL_STORAGE_BASE = {
  ENGINE: "ENGINE",
  CURRENT_ENGINE: "CURRENT_ENGINE",
};

export const LOCAL_STORAGE_ENGINE_KEY = `${LOCAL_STORAGE_NAMESPACE}__${LOCAL_STORAGE_BASE.ENGINE}`;

export const LOCAL_STORAGE_CURRENT_ENGINE_KEY = `${LOCAL_STORAGE_NAMESPACE}__${LOCAL_STORAGE_BASE.CURRENT_ENGINE}`;

export const ACTIONS = {
  RUN: "RUN_ENGINE",
  RANDOM: "RANDOM_HEX",
};

export const RUN_ENGINE_ROLL = "sum(2d6)";

export const RANDOM_HEX_ROLL = "1d19";

export const ROLL_DELAY = 1000;

export const DEFAULT_STARTING_HEX = 1;

export const ROLL_DIRECTION_ORDER = [
  "upRight",
  "downRight",
  "down",
  "downLeft",
  "upLeft",
  "up",
];
