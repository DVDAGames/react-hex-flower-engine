import semver from "semver";

export default (currentEngineVersion = "", storedEngineVersion = "") => {
  if (currentEngineVersion && storedEngineVersion) {
    if (
      semver.valid(semver.coerce(currentEngineVersion)) &&
      semver.valid(semver.coerce(storedEngineVersion))
    ) {
      return semver.gt(currentEngineVersion, storedEngineVersion);
    }
  }

  return true;
};
