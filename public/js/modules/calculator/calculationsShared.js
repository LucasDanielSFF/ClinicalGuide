export function calcMedian(min, max) {
  return (parseFloat(min) + parseFloat(max)) / 2;
}

export function convertToMcg(value, unit) {
  const [massUnit] = unit.split('/');
  switch (massUnit) {
    case 'mg': value *= 1000; break;
    case 'g':  value *= 1000000; break;
    default:
  }
  return value;
}

export function convertMassUnit(value, fromUnit, toUnit) {
  const units = { mcg: 1, mg: 1000, g: 1000000 };
  return (value * units[fromUnit]) / units[toUnit];
}

export function formatConcentration(value) {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(2)} g/mL`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(2)} mg/mL`;
  } else {
    return `${value.toFixed(2)} mcg/mL`;
  }
}

export function computeFinalConcentration(medVol, solVol, concVal, concUnit) {
  const totalVolume = medVol + solVol || 0.1;
  const concMcgPerMl = convertToMcg(concVal, concUnit);
  const totalDrug = medVol * concMcgPerMl;
  return totalDrug / totalVolume;
}
