import { createInfusionUI, createBolusUI } from './uiTemplates.js';
import { initBolusCard, initInfusionCard } from './cardManager.js';
import { medicationsDB } from '../../../data/medicationsDB.js';

export const getLockOptions = (config) => {
  const isUniversal = config.tab === 'universal';
  return {
    medication: isUniversal ? false : true,
    presentation: isUniversal ? false : true,
    dilution: isUniversal ? false : true,
    medVolume: isUniversal ? false : true,
    concentration: isUniversal ? false : true,
    solvent: isUniversal ? false : true,
    doseOption: isUniversal ? false : true, 
    ...(config.lockOptions || {})
  };
};

export const tabConfigurations  = {
  iot:      { cardAddRmv: false, title: 'Intubação Orotraqueal' },
  test:     { cardAddRmv: false, title: 'Teste' },
  infusion: { cardAddRmv: false, title: 'Infusões Contínuas' },
  infusionunlck: { cardAddRmv: true, title: 'Infusões Desbloqueadas' },
  bolus:    { cardAddRmv: false, title: 'Medicações em Bolus' },
  bolusunlck:    { cardAddRmv: true, title: 'Bolus Desbloqueado' },
  universal: { cardAddRmv: true, title: 'Cards Personalizados' }
};

export const getTabConfig = (tabId) => tabConfigurations[tabId] || { cardAddRmv: false, title: '' };

export const cardStrategies = {
  bolus: {
    createUI: createBolusUI,
    init: initBolusCard
  },
  infusion: {
    createUI: createInfusionUI,
    init: initInfusionCard
  }
};

export const configCardsPerTab = { // key, type, doseOptionsID, presentationIndex, lockOptions {medication, presentation, doseOption / medication, dilution, medVolume, concentration, solvent, doseOption}
  iot: [
    { key: 'fentanila',  type: 'bolus', doseOptionId: 'iot' },
    { key: 'midazolam',  type: 'bolus', doseOptionId: 'iot', presentationIndex: 1 },
    { key: 'cetamina',   type: 'bolus', doseOptionId: 'iot' },
    { key: 'etomidato',  type: 'bolus', doseOptionId: 'iot' },
    { key: 'rocuronio',  type: 'bolus', doseOptionId: 'iot' }
  ],
  test: [
    { key: 'fentanila',  type: 'bolus', doseOptionId: 'iot' },
    { key: 'midazolam',  type: 'bolus', doseOptionId: 'iot', presentationIndex: 1, lockOptions: { medication: false } },
    { key: 'dobutamina', type: 'infusion', doseOptionId: 'padrao', lockOptions: { medication: false } },
    { key: 'etomidato',  type: 'bolus', doseOptionId: 'iot' },
    { key: 'rocuronio',  type: 'bolus', doseOptionId: 'iot' }
  ],
  infusion: Object.keys(medicationsDB)
    .filter(medKey => medicationsDB[medKey].admtype?.infusion)
    .map(medKey => {
      const medInf = medicationsDB[medKey].admtype.infusion;
      const doseOptionId = medInf.doseOptions?.[0]?.id;
      return {
        key: medKey,
        type: 'infusion',
        doseOptionId: doseOptionId || null,
        presentationIndex: 0
      };
    }),
  infusionunlck: Object.keys(medicationsDB)
    .filter(medKey => medicationsDB[medKey].admtype?.infusion)
    .map(medKey => {
      const medInf = medicationsDB[medKey].admtype.infusion;
      const doseOptionId = medInf.doseOptions?.[0]?.id;
      return {
        key: medKey,
        type: 'infusion',
        doseOptionId: doseOptionId || null,
        presentationIndex: 0,
        lockOptions: {
          medication: false,
          dilution: false,
          medVolume: false,
          concentration: false,
          solvent: false
        }
      };
    }),
  bolus: Object.keys(medicationsDB)
    .filter(medKey => medicationsDB[medKey].admtype?.bolus)
    .map(medKey => ({
      key: medKey,
      type: 'bolus',
      presentationIndex: 0
    })),
  bolusunlck: Object.keys(medicationsDB)
    .filter(medKey => medicationsDB[medKey].admtype?.bolus)
    .map(medKey => ({
      key: medKey,
      type: 'bolus',
      presentationIndex: 0,
      lockOptions: {
        medication: false,
        presentation: false
      }
    })),
  universal: []
};
