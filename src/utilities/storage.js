const CACHE = process.env.REACT_APP_NO_CACHE !== "TRUE";

export default {
  get: (key) => JSON.parse(localStorage.getItem(key)),
  set: (key, value) => {
    if (CACHE) {
      localStorage.setItem(key, JSON.stringify(value));
    }
  },
};
