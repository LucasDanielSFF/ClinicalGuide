import { changeCardType } from "./cardManager.js";
import { updateAllCardsOnWeightChange, getGlobalWeight } from './sharedUtils.js'
import { getTabConfig } from './configCalc.js';

export function setupCardCollapse(container) {
  const cardBody = container.querySelector('.card-body');
  const header = document.createElement('div');

  header.className = 'row bold collapsible-header';
  header.dataset.titleId = `${container.id}-title`;
  
  container.insertBefore(header, cardBody);
  
  header.addEventListener('click', () => {
    cardBody.classList.toggle('expanded'); header.classList.toggle('expanded')
  });
}

export function createTabContent(tabId) {
  const config = getTabConfig(tabId);
  const content = document.createElement('div');
  content.className = `tab-content row`;
  content.id = tabId;

  const container = document.createElement('div');
  container.id = `${tabId}-container`;

  const headerHTML = `
    <div class="row tab-header">
      <h3>${config.title}</h3>
      ${config.cardAddRmv ? 
        '<button class="btn btn-universal">+ Novo Card</button>' : ''}
    </div>
  `;

  content.innerHTML = headerHTML;
  content.appendChild(container);

  if(config.cardAddRmv) {
    const btn = content.querySelector('.btn-universal');
    btn.addEventListener('click', () => addUniversalCard(tabId));
  }
  
  return content;
}

let universalCardCounter = 0;
export function addUniversalCard() {
  const container = document.getElementById('universal-container');
  const cardId = `universal-card-${universalCardCounter++}`;
  
  const wrapper = document.createElement('div');
  wrapper.className = 'card-container';
  wrapper.id = cardId;
  wrapper.dataset.tab = 'universal';
  
  wrapper.innerHTML = `
    <div class="card-body">
      <div class="row card-actions">
        <select class="form card-type-select">
          <option value="bolus">Bolus</option>
          <option value="infusion">Infusão</option>
        </select>
        <button class="btn btn-danger btn-remove-card">×</button>
      </div>
      <div id="${cardId}-content"></div>
    </div>
  `;
  
  container.appendChild(wrapper);

  const typeSelect = wrapper.querySelector('.card-type-select');
  const removeBtn = wrapper.querySelector('.btn-remove-card');

  setupCardCollapse(wrapper);

  typeSelect.addEventListener('change', (e) => 
    changeCardType(cardId, e.target.value)
  );
  
  removeBtn.addEventListener('click', () => wrapper.remove());

  changeCardType(cardId, typeSelect.value);
}

export function initEventListeners() {
  const weightInput = document.getElementById('patient-weight');
  const errorDiv = document.getElementById('weight-error');
  
  const handleWeightChange = () => {
    const rawValue = weightInput.value;
    const weight = getGlobalWeight(weightInput);
    const isValid = weight !== 70 || rawValue === "70";
    
    weightInput.classList.toggle('is-invalid', !isValid && rawValue !== "");
    errorDiv.classList.toggle('show', !isValid && rawValue !== "");
    
    return isValid;
  };

  weightInput.addEventListener('input', () => {
    weightInput.value = weightInput.value.replace(/\D/g, '');
    handleWeightChange();
  });
  
  weightInput.addEventListener('blur', () => {
    weightInput.value = Math.min(Math.max(parseInt(weightInput.value) || 70, 40), 300);
    handleWeightChange() && updateAllCardsOnWeightChange();
  });
  
  weightInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') weightInput.blur();
  });

  weightInput.addEventListener('change', () => {
    updateAllCardsOnWeightChange();
  });
}