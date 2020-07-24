export const getFeatureValue = (type = "", hexObject = {}, features = {}) => {
  if (Object.hasOwnProperty.call(hexObject, type)) {
    if (typeof hexObject?.[type] === "string") {
      return hexObject[type];
    }

    if (hexObject[type]?.default && !features) {
      return hexObject.icon?.default;
    }

    if (features) {
      if (
        typeof hexObject[type] === "object" &&
        !Object.prototype.hasOwnProperty.call(hexObject[type], "default")
      ) {
        return hexObject[type];
      }

      const enabledFeaturesKey = Object.keys(features)
        .filter((feature) => features[feature])
        .join("/");

      if (hexObject?.[type]?.[enabledFeaturesKey]) {
        return hexObject[type][enabledFeaturesKey];
      } else {
        let iconKey = "default";

        Object.keys(features).some((feature) => {
          if (hexObject?.[type]?.[feature] && features[feature]) {
            iconKey = feature;

            return true;
          }

          return false;
        });

        if (hexObject?.[type]?.[iconKey]) {
          return hexObject[type][iconKey];
        }
      }
    }
  }

  return "";
};

export const getLabel = (hexObject, features) =>
  getFeatureValue("label", hexObject, features);

export const getIcon = (hexObject, features) =>
  getFeatureValue("icon", hexObject, features);

export const getBackgroundColor = (hexObject, features) =>
  getFeatureValue("backgroundColor", hexObject, features);

export const getModifiers = (hexObject, features) =>
  getFeatureValue("modifiers", hexObject, features);
