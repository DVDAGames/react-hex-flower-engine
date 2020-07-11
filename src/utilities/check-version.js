import semver from "semver";

export default (currentEngineVersion, storedEngineVersion) => {
  return semver.gt(currentEngineVersion, storedEngineVersion);
};
