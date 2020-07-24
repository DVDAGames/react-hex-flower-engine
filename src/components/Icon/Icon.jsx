import React from "react";

import {
  ArrowLoading,
  Cloudy,
  CloudyAndWindy,
  Day,
  DayCloudy,
  DayCloudyFoggy,
  DayCloudyWindy,
  DayPartlyCloudy,
  DayThunderstorms,
  Hot,
  MostlyCloudy,
  Night,
  NotAvailable,
  Rain,
  Thundershowers,
  Thunderstorms,
  Tornado,
  Wind,
} from "./icons";

import styles from "./Icon.module.scss";

const iconMap = {
  "arrow-loading": ArrowLoading,
  cloudy: Cloudy,
  "cloudy-and-windy": CloudyAndWindy,
  day: Day,
  "day-cloudy": DayCloudy,
  "day-cloudy-foggy": DayCloudyFoggy,
  "day-cloudy-windy": DayCloudyWindy,
  "day-partly-cloudy": DayPartlyCloudy,
  "day-thunderstorms": DayThunderstorms,
  hot: Hot,
  "mostly-cloudy": MostlyCloudy,
  night: Night,
  "not-available": NotAvailable,
  rain: Rain,
  thundershowers: Thundershowers,
  thunderstorms: Thunderstorms,
  tornado: Tornado,
  wind: Wind,
};

export const Icon = ({ icon, label, id }) => {
  const Icon = iconMap[icon];

  return Icon ? (
    <div className={styles.iconContainer}>
      <Icon label={label} />
      <div>
        <p>{id}</p>
      </div>
    </div>
  ) : (
    <></>
  );
};
