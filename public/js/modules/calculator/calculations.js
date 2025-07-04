import { medicationsDB } from '../../../data/medicationsDB.js';
import { getGlobalWeight } from './sharedUtils.js';
import { convertMassUnit, formatConcentration, computeFinalConcentration } from './calculationsShared.js';

function getDoseConfig(doseSelect, doseOptions, defaultDose) {
  return doseSelect?.value && doseOptions 
    ? doseOptions.find(opt => opt.id === doseSelect.value) || defaultDose
    : defaultDose;
}

export function calcBolus(cardId) {
  const card = document.getElementById(cardId);
  const elements = getBolusElements(card);
  
  if (!elements.medSelect || !medicationsDB[elements.medSelect.value]?.admtype?.bolus) {
    updateBolusUI(card, 0, 0);
    return;
  }

  const weight = getGlobalWeight();
  const medKey = elements.medSelect.value;
  const bolusConfig = medicationsDB[medKey].admtype.bolus;
  
  const doseConfig = getDoseConfig(
    elements.doseSelect,
    bolusConfig.doseOptions,
    bolusConfig.dose
  );
  
  const dose = parseFloat(elements.doseSlider.value);
  const concVal = parseFloat(elements.presSelect.value);
  const volume = calcVolume(doseConfig.unit, dose, concVal, weight);
  
  updateBolusUI(card, dose, volume);
}

function getBolusElements(card) {
  return {
    medSelect: card.querySelector('.bolus-med-select'),
    doseSelect: card.querySelector('.bolus-dose-select'),
    doseSlider: card.querySelector('.bolus-dose-slider'),
    presSelect: card.querySelector('.bolus-pres-select')
  };
}

function calcVolume(unit, dose, concVal, weight) {
  return calcBolusDose(unit, dose, weight) / concVal;
}

function calcBolusDose(unit, dose, weight) {
  const multipliers = { 'mg/kg': 1000, 'g/kg': 1_000_000 };
  return dose * weight * (multipliers[unit] || 1);
}

function updateBolusUI(card, dose, volume) {
  card.querySelector('.volume-result').textContent = volume.toFixed(2);
  card.querySelector('.dose-value').textContent = dose.toFixed(2);
}

export function calcInfusion(cardId, doseOverride = null) {
  const card = document.getElementById(cardId);
  const elements = getInfusionElements(card);

  const weight = getGlobalWeight();
  const medKey = elements.medSelect.value;
  const medInf = medicationsDB[medKey].admtype.infusion;
  
  const doseConfig = getDoseConfig(
    elements.doseSelect,
    medInf.doseOptions,
    medInf.dose
  );
  
  let dose = getValidDose(doseOverride, elements, doseConfig);
  try {
    dose = convertAndClampDose(dose, doseConfig, elements);
    updateDoseUI(elements, dose);
    
    const finalConc = computeConcentration(elements);
    const flowRate = calculateFlowRate(dose, doseConfig, weight, finalConc, elements);
    
    card.querySelector('.flow-result').textContent = flowRate.toFixed(2);
    card.querySelector('.final-conc').textContent = formatConcentration(finalConc);
  } catch (error) {
    handleCalcError(card, error);
  }
}

export function calcRevInfusion(cardId) {
  const card = document.getElementById(cardId);
  const weight = getGlobalWeight();

  const elements = {
    medSelect: card.querySelector('.infusion-med-select'),
    doseSelect: card.querySelector('.infusion-dose-select'),
    reverseFlowInput: card.querySelector('.reverse-flow-input')
  };
  
  const medInf = medicationsDB[elements.medSelect?.value]?.admtype?.infusion;
  const doseConfig = getDoseConfig(
    elements.doseSelect,
    medInf.doseOptions,
    medInf.dose
  );
  
  const doseTimeUnit = doseConfig.unit.split('/').pop();
  const medVol = Number(card.querySelector('.infusion-med-vol').value) || 0;
  const solVol = Number(card.querySelector('.infusion-sol-volume').value) || 0;
  const concVal = Number(card.querySelector('.infusion-conc-value').value) || 0;
  const concUnit = card.querySelector('.infusion-conc-unit').value;
  
  const finalConc = computeFinalConcentration(medVol, solVol, concVal, concUnit);
  const flowRate = parseFloat(elements.reverseFlowInput.value) || 0;
  
  let dose;
  if (doseTimeUnit === 'min') {
    dose = ((flowRate / 60) * finalConc) / weight;
  } else {
    dose = (flowRate * finalConc) / weight;
  }

  card.querySelector('.reverse-dose-result').textContent = dose.toFixed(2);
}

function getInfusionElements(card) {
  return {
    medSelect: card.querySelector('.infusion-med-select'),
    doseSlider: card.querySelector('.infusion-dose-slider'),
    doseSelect: card.querySelector('.infusion-dose-select'),
    timeUnit: card.querySelector('.infusion-time-unit'),
    massUnit: card.querySelector('.infusion-mass-unit'),
    medVolume: card.querySelector('.infusion-med-vol'),
    solVolume: card.querySelector('.infusion-sol-volume'),
    concValue: card.querySelector('.infusion-conc-value'),
    concUnit: card.querySelector('.infusion-conc-unit')
  };
}

function getValidDose(doseOverride, elements, doseConfig) {
  const dose = doseOverride !== null 
    ? Number(doseOverride) 
    : Number(elements.doseSlider.value);
    
  return isNaN(dose) ? (parseFloat(doseConfig.min) + parseFloat(doseConfig.max)) / 2 : dose;
}

function convertAndClampDose(dose, doseConfig, elements) {
  const [baseUnit, originalTime] = doseConfig.unit.split('/');
  const massUnit = elements.massUnit?.value || baseUnit;
  const timeUnit = elements.timeUnit?.value || originalTime;

  // Conversão de unidade de massa
  let convertedDose = massUnit !== baseUnit
    ? convertMassUnit(dose, baseUnit, massUnit)
    : dose;

  // Conversão de unidade de tempo
  if (timeUnit !== originalTime) {
    convertedDose *= originalTime === 'min' && timeUnit === 'h' ? 60
      : originalTime === 'h' && timeUnit === 'min' ? 1/60 
      : 1;
  }

  // Limites com conversão de unidades
  const min = convertMassUnit(doseConfig.min, baseUnit, massUnit);
  const max = convertMassUnit(doseConfig.max, baseUnit, massUnit);
  return Math.min(Math.max(convertedDose, min), max);
}

function updateDoseUI(elements, dose) {
  elements.doseSlider.value = dose.toFixed(2);
  if (elements.doseSlider.closest('.dose-section')) {
    elements.doseSlider.closest('.dose-section')
      .querySelector('.dose-value').textContent = dose.toFixed(2);
  }
}

function computeConcentration(elements) {
  const medVol = Number(elements.medVolume.value) || 0;
  const solVol = Number(elements.solVolume.value) || 0;
  const concVal = Number(elements.concValue.value) || 0;
  return computeFinalConcentration(medVol, solVol, concVal, elements.concUnit.value);
}

function calculateFlowRate(dose, doseConfig, weight, finalConc, elements) {
  const [doseUnitMass] = doseConfig.unit.split('/');
  const timeUnit = elements.timeUnit?.value || doseConfig.unit.split('/').pop();
  
  const doseInMcg = convertMassUnit(dose, doseUnitMass, 'mcg');
  const flowRateBase = (doseInMcg * weight) / finalConc;
  return timeUnit === 'min' ? flowRateBase * 60 : flowRateBase;
}

function handleCalcError(card, error) {
  console.error('Erro nos cálculos:', error);
  card.querySelector('.flow-result').textContent = '0.00';
  card.querySelector('.final-conc').textContent = '0.00';
}