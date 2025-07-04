import { cardStrategies, configCardsPerTab, getTabConfig , getLockOptions } from './configCalc.js';
import { medicationsDB } from '../../../data/medicationsDB.js';
import { calcBolus, calcInfusion, calcRevInfusion } from './calculations.js';
import { calcMedian } from './calculationsShared.js';
import { generateCardId } from './calculator.js';
import { updateSliderAndUI, updateAllCardsOnWeightChange } from './sharedUtils.js';
import { setupCardCollapse, createTabContent } from './cardComponent.js';

export function clearTabContent() {
  document.querySelectorAll('.tab-content').forEach(pane => pane.remove());
}

export function initialCardLoading(tab) {
  clearTabContent();

  const content = createTabContent(tab);
  document.querySelector('.container-fluid').appendChild(content);
  
  const containerId = `${tab}-container`;/*
  const containerElement = document.getElementById(containerId);
  if (containerElement) {
    containerElement.classList.add('grid-2');
  }*/
  const tabConfig = getTabConfig(tab);

  configCardsPerTab[tab].forEach(medConfig => {
    const cardId = generateCardId();
    const cardCol = document.createElement('div');
    cardCol.className = 'card-container';
    cardCol.id = cardId;
    if (medConfig.doseOptionId) {
      cardCol.dataset.doseOptionId = medConfig.doseOptionId;
    }
    cardCol.innerHTML = `
      ${tabConfig.cardAddRmv ? `
        <div class="card-actions">
          <button class="btn btn-remove-card">×</button>
        </div>` : ''}
      <div class="card-body" id="${cardId}-content"></div>
    `;
    document.getElementById(containerId).appendChild(cardCol);
    setupCardCollapse(cardCol);

    if (tabConfig.cardAddRmv) {
      const removeBtn = cardCol.querySelector('.btn-remove-card');
      removeBtn.addEventListener('click', () => cardCol.remove());
    }

    updateCardContent(cardId, medConfig.type, medConfig.key, {
    ...medConfig,
    tab: tab});
  });
}

export function updateCardContent(cardId, type, medKey, config = {}) {
  const containerDiv = document.getElementById(`${cardId}-content`);
  const card = document.getElementById(cardId);

  if (card && card._listeners) {
    Object.values(card._listeners).forEach(listener => {
      if (listener && listener.element && listener.handler) {
        listener.element.removeEventListener(listener.type, listener.handler);
      }
    });
    delete card._listeners;
  }

  const header = card?.querySelector('.collapsible-header');
  if (header) {
    header.textContent = medicationsDB[medKey]?.name || 'Nova Medicação';
  }

  const strategy = cardStrategies[type];
  containerDiv.innerHTML = strategy.createUI(cardId, medKey, config);
  strategy.init(cardId, medKey, {
    ...config,
    doseOptionId: null,
    lockOptions: getLockOptions(config)
  });
  updateAllCardsOnWeightChange()
}

export function initBolusCard(cardId, medKey, config = {}) {
  const selectors = {
    medSelect: '.bolus-med-select',
    doseSelect: '.bolus-dose-select',
    inputElements: '.bolus-dose-slider, .bolus-pres-select',
    calcFunction: calcBolus
  };

  initCard(cardId, medKey, config, 'bolus', selectors);
}

export function initInfusionCard(cardId, medKey, config = {}) {
  const card = document.getElementById(cardId);
  if (!card._listeners) card._listeners = {};
  const selectors = {
    medSelect: '.infusion-med-select',
    doseSelect: '.infusion-dose-select',
    inputElements: '.infusion-dose-slider, .infusion-med-vol, .infusion-sol-volume, .infusion-conc-value, .infusion-conc-unit',
    calcFunction: calcInfusion
  };

  const medSelect = card.querySelector('.infusion-med-select'); 
  const doseSelect = card.querySelector('.infusion-dose-select');
  if (doseSelect && config.doseOptionId) {
    doseSelect.value = config.doseOptionId;
  }
  const dilSelect = card.querySelector('.infusion-dilution-select');
  const customBtn = card.querySelector('.btn-custom-dilution');
  const medVolumeInput = card.querySelector('.infusion-med-vol');
  const solVolumeInput = card.querySelector('.infusion-sol-volume');
  const concValueInput = card.querySelector('.infusion-conc-value');
  const concUnitSelect = card.querySelector('.infusion-conc-unit');
  const toggleBtn = card.querySelector('.btn-toggle-reverse');
  const reverseSection = card.querySelector('.reverse-calculation');

  const toggleRevCalc = () => {
  const isReverseHidden = reverseSection.classList.toggle('hidden');
    card.querySelectorAll('.dose-section, .result-container').forEach(section => {
      section.classList.toggle('hidden', !isReverseHidden);
    });
    if (toggleBtn) {
      toggleBtn.textContent = isReverseHidden ? '▼ Cálculo Reverso' : '▲ Ocultar';
    }
  };
  toggleBtn?.addEventListener('click', toggleRevCalc);
  card._listeners.toggleBtn = { element: toggleBtn, type: 'click', handler: toggleRevCalc };

  const setCustomDil = (active = !customBtn.classList.contains('active')) => {
    customBtn.classList.toggle('active', active);
    [medVolumeInput, solVolumeInput, concValueInput].forEach(input => input.readOnly = !active);
    concUnitSelect.disabled = !active;
    calcInfusion(cardId);
    calcRevInfusion(cardId);
  };

  customBtn?.addEventListener('click', () => setCustomDil());
  card._listeners.customBtn = {
    element: customBtn,
    type: 'click',
    handler: () => setCustomDil()
  };

  setCustomDil(false);

  const handleDilutionSelect = () => {
    const dilution = medicationsDB[medKey]?.admtype?.infusion.dilution[dilSelect.value];

    const { medVolume, solVolume, concValue, concUnit } = dilution;
    [medVolumeInput.value, solVolumeInput.value, concValueInput.value, concUnitSelect.value] = 
      [medVolume, solVolume, concValue, concUnit];
    
    setCustomDil(false);
    doseSelect?.value && (doseSelect.value = doseSelect.value);
      calcInfusion(cardId);
      calcRevInfusion(cardId);
  };

  dilSelect?.addEventListener('input', handleDilutionSelect);
  card._listeners.dilSelect = {
    element: dilSelect,
    type: 'input',
    handler: handleDilutionSelect
  };

  card.querySelector('.reverse-flow-input')?.addEventListener('input', () => {
    calcRevInfusion(cardId);
  });

  card.querySelectorAll('.infusion-med-vol, .infusion-sol-volume, .infusion-conc-value, .infusion-conc-unit').forEach(el => {
    el.addEventListener('input', () => {
      calcInfusion(cardId);
      calcRevInfusion(cardId);
    });
  });

  initCard(cardId, medKey, config, 'infusion', selectors);
}

export function initCard(cardId, medKey, config, type, selectors) {
  const card = document.getElementById(cardId);
  const selectMed = card.querySelector(selectors.medSelect);
  const medData = medicationsDB[medKey]?.admtype?.[type];

  const doseConfig = config.doseOptionId && medData.doseOptions?.find(opt => opt.id === config.doseOptionId) || medData.dose;
  const medianValue = calcMedian(doseConfig.min, doseConfig.max);
  updateSliderAndUI(card, doseConfig, medianValue, type);

  const doseSelect = card.querySelector(selectors.doseSelect);
  if (doseSelect) {
    doseSelect.addEventListener('input', () => {
      const newDose = medData.doseOptions?.find(opt => opt.id === doseSelect.value);
      if (newDose) {
        updateSliderAndUI(card, newDose, calcMedian(newDose.min, newDose.max), type);
        selectors.calcFunction(cardId);
      }
    });
  }

  if (selectMed) {
    selectMed.addEventListener('input', () => {
      const newMedKey = selectMed.value;
      updateCardContent(cardId, type, newMedKey, config);
    });
  }

  card.querySelectorAll(selectors.inputElements).forEach(el => {
    el.addEventListener('input', () => selectors.calcFunction(cardId));
  });

  selectors.calcFunction(cardId);
}

export function changeCardType(cardId, newType) {
  const cardEl = document.getElementById(cardId);
  const tab = cardEl.dataset.tab || 'universal';
  const initialMedKey = Object.keys(medicationsDB).find(key =>
    medicationsDB[key]?.admtype?.[newType]
  );
  updateCardContent(cardId, newType, initialMedKey, { 
    tab: tab
  });
}