import { calcMedian } from './calculationsShared.js';
import { medicationsDB } from '../../../data/medicationsDB.js';
import { getLockOptions } from './configCalc.js';

const getMedOptions = (admType, currentKey) => 
  Object.entries(medicationsDB)
    .map(([key, med]) => med.admtype?.[admType] 
      ? `<option value="${key}" ${key === currentKey ? 'selected' : ''}>${med.name}</option>`
      : ''
    ).join('');

const getDoseOptionsHTML = (doseOptions, selectedId) =>
  doseOptions?.map(opt => `
    <option value="${opt.id}" ${selectedId === opt.id ? 'selected' : ''}>
      ${opt.label}
    </option>
  `).join('') || '';

const buildDoseSection = (doseConfig, avgVal, cssClass) => `
  <label class="flex">
    <div class="row">
    <p class="bold">Dose:</p>
      <p class="dose-value">${avgVal}</p>
      <p class="dose-unit">${doseConfig.unit}</p>
    </div>
    <div class="row">
      <p class="dose-info">(Faixa: ${doseConfig.min} - ${doseConfig.max} ${doseConfig.unit})</p>
    </div>
  </label>
  <div class="slider-wrapper">
    <div class="ticks-container">
      <div class="ticks"></div>
    </div>
      <input type="range" class="form-range ${cssClass}-dose-slider"min="${doseConfig.min}" max="${doseConfig.max}" step="${doseConfig.step}" value="${avgVal}">
  </div>
`;

export function createBolusUI(cardId, medKey, config = {}) {
  const lockOptions = getLockOptions(config);
  const med = medicationsDB[medKey]?.admtype?.bolus;

  const presentationIndex = config.presentationIndex || 0;
  const doseConfig = config.doseOptionId 
    ? med.doseOptions.find(opt => opt.id === config.doseOptionId)
    : med.dose;

  const avgVal = calcMedian(doseConfig.min, doseConfig.max);

  return `
    <div class="row gx-3 gy-1" id="med-settings">
      <div class="flex form-label ${lockOptions.medication ? 'hidden' : ''}">
       <label>Medicação:</label>
        <select class="border dropdown form bolus-med-select">
          ${getMedOptions('bolus', medKey)}
        </select>
      </div>

      <div class="flex form-label">
        <label>Apresentação:</label>
        <select class="border dropdown form bolus-pres-select" ${lockOptions.presentation ? 'disabled' : ''}>
          ${med.presentation.map((p, i) => `
            <option value="${p.value}" ${i === presentationIndex ? 'selected' : ''}>${p.label}</option>
          `).join('')}
        </select>
      </div>

      ${!lockOptions.doseOption ? `
        <div class="row flex form-label">
            <label>Perfil de Dose:</label>
            <select class="subcontainer border dropdown form bolus-dose-select">
              ${getDoseOptionsHTML(med.doseOptions, config.doseOptionId)}
            </select>
          </div>
        </div>
      ` : ''}

      <div class="row" id="med-dose">
        ${buildDoseSection(doseConfig, avgVal, 'bolus')}
      </div>

      <div class="result-container">
        <p class="flex">Volume calculado: <span class="no-format volume-result">0.00</span> mL</p>
      </div>
    </div>
  `;
}

export function createInfusionUI(cardId, medKey, config = {}) {
  const lockOptions = getLockOptions(config);
  const med = medicationsDB[medKey]?.admtype?.infusion;

  const doseConfig = config.doseOptionId 
    ? med.doseOptions?.find(opt => opt.id === config.doseOptionId) 
    : med.dose;

  const diluicao = med.dilution[0] || {};
  const [massUnit, timeUnit] = doseConfig.unit.split('/');
  const avgVal = calcMedian(doseConfig.min, doseConfig.max);
  const canToggle = ['min', 'h'].includes(timeUnit); 

  return `
    <div class="row gx-3" id="med-settings">

      <div class="flex row gx-4 gy-1">
        <div class="form-label ${lockOptions.medication ? 'hidden' : ''}">
          <label>Medicação: </label>
          <select class="subcontainer px-4 dropdown form infusion-med-select">
            ${getMedOptions('infusion', medKey)}
          </select>
        </div>

        <div class="flex gx-4 form-label">
          <label>Diluição: </label>
          <select class="subcontainer dropdown form infusion-dilution-select"
            ${lockOptions.dilution ? 'disabled' : ''}>
            ${(med.dilution || []).map((d, i) => `
              <option value="${i}">${d.label}</option>
            `).join('')}
          </select>
          <button class="btn btn-custom-dilution"
            ${lockOptions.dilution ? 'disabled' : ''}>
            <svg width="24" height="24" fill="currentColor" class="" viewBox="0 0 16 16">
              <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
            </svg>
          </button>
        </div>
      </div>

      <div class="flex row gx-4 gy-1">
        <div class="flex form-label">
          <label>Medicamento: </label>
          <input type="number"
            class="subcontainer px-4 dropdown form nrbr infusion-med-vol"
            value="${diluicao.medVolume || 10}"
            ${lockOptions.medVolume ? 'disabled' : ''}>
          </input>          
          <p class="py-2 px-8 flex form-text form border nlbr inf-form-text">mL</p>
        </div>

        <div class="flex form-label">
          <label>Concentração: </label>
          <div class="flex infusion-conc">
            <input type="number"
              class="number-ipt subcontainer form nrbr infusion-conc-value"
              value="${diluicao.concValue || 50}"
              ${lockOptions.concentration ? 'disabled' : ''}>
            <select class="subcontainer dropdown form nlbr infusion-conc-unit"
            ${lockOptions.concentration ? 'disabled' : ''}>
              <option value="mcg/mL" ${diluicao.concUnit === 'mcg/mL' ? 'selected' : ''}>mcg/mL</option>
              <option value="mg/mL" ${diluicao.concUnit === 'mg/mL' ? 'selected' : ''}>mg/mL</option>
              <option value="g/mL" ${diluicao.concUnit === 'g/mL' ? 'selected' : ''}>g/mL</option>
            </select>
          </div>
        </div>

        <div class="flex form-label">
          <label>Diluente: </label>
          <input type="number"
            class="subcontainer px-4 dropdown form nrbr infusion-sol-volume"
            value="${diluicao.solVolume || 50}"
            ${lockOptions.solvent ? 'disabled' : ''}>
          </input>
          <p class="py-2 px-8 flex form-text form border nlbr inf-form-text">mL</p>
        </div>
      </div>

      ${med.doseOptions && !lockOptions.doseOption ? `
        <div class="row flex form-label infusion-dose-select-text">
          <label>Perfil de Dose: </label>
          <select class="subcontainer border dropdown form infusion-dose-select">
            ${getDoseOptionsHTML(med.doseOptions, config.doseOptionId)}
          </select>
        </div>
      ` : ''}

      <div class="row dose-section">
        ${buildDoseSection(doseConfig, avgVal, 'infusion')}
      </div>

      <div class="row result-container">
        <p class="flex">Vazão calculada: <span class="no-format flow-result">0.00</span> mL/h</p>
      </div>

      <div class="row dose-info">
        <p>Concentração final: <span class="final-conc">0.00</span></p>
      </div>
    </div>

    <div class="reverse-calculation hidden">
      <div class="row">
        <label class="form-label">Vazão (mL/h)</label>
        <input type="number" class="reverse-flow-input number-ipt subcontainer form border">
      </div>
      <div class="flex flow-container my-3">
        <p>Dose calculada: <span class="reverse-dose-result">0.00</span></p>
      </div>
    </div>

    <div class="flex">
      <button class="btn btn-toggle-reverse btn-sm mt-2">▼ Cálculo Reverso</button>
    </div>
  `;
}