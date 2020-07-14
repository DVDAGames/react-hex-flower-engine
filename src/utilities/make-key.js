import { LOCAL_STORAGE_ENGINE_KEY } from "../constants";

export default (slug, prefix = LOCAL_STORAGE_ENGINE_KEY) => {
  return `${prefix}_${slug}`;
};
