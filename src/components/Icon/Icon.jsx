import React from "react";

import { NotAvailable, Tornado } from "./icons";

const iconMap = {
  "not-available": NotAvailable,
  tornado: Tornado,
};

export const Icon = ({ icon, label }) => {
  const Icon = iconMap[icon];

  return Icon ? <Icon label={label} /> : <></>;
};
