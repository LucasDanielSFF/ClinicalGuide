import { medicationsDB } from '../../../data/medicationsDB.js';
import { calcBolus, calcInfusion } from './calculations.js';
import { calcMedian } from './calculationsShared.js';
import { setupSlidingTicks, cleanupSlidingTicks } from './slider.js';
import { getLockOptions } from './configCalc.js';

export function getGlobalWeight(weightInput = null) {
  const weight = weightInput || document.getElementById('patient-weight');
  const rawValue = weight.value;
  const weightValue = parseInt(rawValue, 10);
  
  if (isNaN(weightValue) || weightValue < 40 || weightValue > 300) {
    return 70;
  }
  return weightValue;
}

export function updateSliderAndUI(card, doseConfig, avgVal, type) {
  const slider = card.querySelector(`.${type}-dose-slider`);
  if (slider && slider._sliderInitialized) {
    cleanupSlidingTicks(slider);
  }

  slider.min = doseConfig.min;
  slider.max = doseConfig.max;
  slider.step = doseConfig.step;
  slider.value = avgVal;

  setupSlidingTicks(slider, doseConfig);
  slider._sliderInitialized = true;

  const event = new Event('input', { bubbles: true });
  slider.dispatchEvent(event);

  const doseValueSpan = card.querySelector('.dose-value');
  const doseUnitSpan = card.querySelector('.dose-unit');
  const doseInfoSpan = card.querySelector('.dose-info');
  
  if (doseValueSpan) doseValueSpan.textContent = avgVal.toFixed(2);
  if (doseUnitSpan) doseUnitSpan.textContent = doseConfig.unit;
  if (doseInfoSpan) {
    doseInfoSpan.textContent = `(Faixa: ${parseFloat(doseConfig.min).toFixed(2)} - ${parseFloat(doseConfig.max).toFixed(2)} ${doseConfig.unit})`;
  }
}

export function updateAllCardsOnWeightChange() {
  document.querySelectorAll('.card-container[id^="card-"]').forEach(cardEl => {
    const cardId = cardEl.id;
    const content = document.getElementById(`${cardId}-content`);

    const config = { tab: cardEl.closest('.tab-content').id };
    const lockOptions = getLockOptions(config);

    if (content.querySelector('.bolus-med-select')) {
      const medKey = content.querySelector('.bolus-med-select').value;
      const bolusData = medicationsDB[medKey]?.admtype?.bolus;
      if (bolusData) {
        const doseOptionId = !lockOptions.doseOption
          ? content.querySelector('.bolus-dose-select')?.value
          : cardEl.dataset.doseOptionId;
        const doseConfig = doseOptionId
          ? bolusData.doseOptions.find(opt => opt.id === doseOptionId)
          : bolusData.dose;
        const avgVal = calcMedian(doseConfig.min, doseConfig.max);
        updateSliderAndUI(cardEl, doseConfig, avgVal, 'bolus');
        calcBolus(cardId);
      }
    } else if (content.querySelector('.infusion-med-select')) {
      const medKey = content.querySelector('.infusion-med-select').value;
      const infData = medicationsDB[medKey]?.admtype?.infusion;
      if (infData) {
        const doseOptionId = content.querySelector('.infusion-dose-select')?.value;
        const doseConfig = doseOptionId
          ? infData.doseOptions.find(opt => opt.id === doseOptionId)
          : infData.dose;
        const avgVal = calcMedian(doseConfig.min, doseConfig.max);
        updateSliderAndUI(cardEl, doseConfig, avgVal, 'infusion');
        calcInfusion(cardId);
      }
    }
  });
}

/*export function updateAllCardsOnWeightChange() {
  document.querySelectorAll('.card-container[id^="card-"]').forEach(cardEl => {
    const cardId = cardEl.id;
    const content = document.getElementById(`${cardId}-content`);

    const config = { tab: cardEl.closest('.tab-content').id };
    const lockOptions = getLockOptions(config);

    if (content.querySelector('.bolus-med-select')) {
      const medKey = content.querySelector('.bolus-med-select').value;
      const bolusData = medicationsDB[medKey]?.admtype?.bolus;
      if (bolusData) {
        const doseOptionId = !lockOptions.doseOption
          ? content.querySelector('.bolus-dose-select')?.value
          : cardEl.dataset.doseOptionId;
        const doseConfig = doseOptionId
          ? bolusData.doseOptions.find(opt => opt.id === doseOptionId)
          : bolusData.dose;
        const avgVal = calcMedian(doseConfig.min, doseConfig.max);
        updateSliderAndUI(cardEl, doseConfig, avgVal, 'bolus');
        calcBolus(cardId);
      }
    } else if (content.querySelector('.infusion-med-select')) {
      const medKey = content.querySelector('.infusion-med-select').value;
      const infData = medicationsDB[medKey]?.admtype?.infusion;
      if (infData) {
        const doseOptionId = content.querySelector('.infusion-dose-select')?.value;
        const doseConfig = doseOptionId
          ? infData.doseOptions.find(opt => opt.id === doseOptionId)
          : infData.dose;
        const avgVal = calcMedian(doseConfig.min, doseConfig.max);
        updateSliderAndUI(cardEl, doseConfig, avgVal, 'infusion');
        calcInfusion(cardId);
      }
    }
  });
}*/