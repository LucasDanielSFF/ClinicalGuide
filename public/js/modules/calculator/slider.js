const SLIDER_WRAPPER_CLASS = '.slider-wrapper';
const TICKS_CLASS = '.ticks';
const TARGET_COLOR_RGB = [255, 56, 96]; // FF3860 como array
const TICK_TRANSITION = 'background-color 0.25s ease';
const SLIDER_TRANSITION = 'transform 0.6s ease-out';
const TICKS_COUNT = 36;

export function setupSlidingTicks(rangeEl, doseConfig) {
  const wrapper = rangeEl.closest(SLIDER_WRAPPER_CLASS);
  if (!wrapper) return console.error('Elemento .slider-wrapper não encontrado', rangeEl);
  
  const ticksEl = wrapper.querySelector(TICKS_CLASS);
  if (!ticksEl) return console.error('Elemento .ticks não encontrado', rangeEl);

  wrapper.style.touchAction = 'none';
  ticksEl.innerHTML = '';
  
  const min = parseFloat(doseConfig.min);
  const max = parseFloat(doseConfig.max);
  if (isNaN(min) || isNaN(max)) return console.error("Valores min/max inválidos", doseConfig);
  
  const originalRange = max - min;
  if (originalRange < 0) return console.warn("originalRange inválido", min, max);

  // Criação otimizada dos ticks
  const frag = document.createDocumentFragment();
  for (let i = 0; i < TICKS_COUNT; i++) {
    const tick = document.createElement('div');
    tick.className = `tick${i % 5 === 0 ? ' tick-large' : ''}`;
    tick.style.left = `${(i / (TICKS_COUNT - 1)) * 100}%`;
    frag.appendChild(tick);
  }
  ticksEl.appendChild(frag);

  // Obtenção simplificada da cor base
  const baseColor = getComputedStyle(ticksEl.firstElementChild).backgroundColor;
  const baseRGB = baseColor.match(/\d+/g) || ['200', '200', '200'];
  const [baseR, baseG, baseB] = baseRGB.map(Number);

  let precisionStep = parseFloat(doseConfig.step) || originalRange / 100;
  if (isNaN(precisionStep)) precisionStep = originalRange / 100;
  
  const tickElements = Array.from(ticksEl.children);
  tickElements.forEach(tick => tick.style.transition = TICK_TRANSITION);
  
  let wrapperWidth = wrapper.offsetWidth;
  const getSnappedValue = val => {
    const snapped = min + Math.round((val - min) / precisionStep) * precisionStep;
    const decimals = precisionStep.toString().includes('.') ? precisionStep.toString().split('.')[1].length : 0;
    return parseFloat(snapped.toFixed(decimals));
  };

  const updatePosition = () => {
    const val = +rangeEl.value;
    const progress = originalRange ? ((val - min) / originalRange) * 100 : 0;
    ticksEl.style.transform = `translateX(${-progress}%)`;
    
    // Cálculo otimizado de proximidade
    const span = originalRange * 0.1;
    let proximity = 0;
    if (span) {
      proximity = Math.min(1, Math.max(
        Math.max(0, 1 - (val - min) / span),
        Math.max(0, (val - (max - span)) / span)
      ));
    } else if (val <= min || val >= max) proximity = 1;
    
    // Cálculo direto de cor
    const color = `rgb(${Math.round(baseR + (TARGET_COLOR_RGB[0] - baseR) * proximity)},${
      Math.round(baseG + (TARGET_COLOR_RGB[1] - baseG) * proximity)},${
      Math.round(baseB + (TARGET_COLOR_RGB[2] - baseB) * proximity)})`;
    
    tickElements.forEach(tick => tick.style.backgroundColor = color);
  };

  updatePosition();
  ticksEl.style.transition = SLIDER_TRANSITION;

  rangeEl.addEventListener('input', () => {
    if (!rangeEl._isPointerDragging) ticksEl.style.transition = SLIDER_TRANSITION;
    requestAnimationFrame(updatePosition);
  });

  // Gestão de eventos de arrasto simplificada
  let startX = 0, startVal = 0, lastMoveX = 0, lastMoveTime = 0, inertiaID = null;
  const damping = 0.5;
  
  const stopInertia = () => inertiaID && (cancelAnimationFrame(inertiaID), inertiaID = null);
  
  const applyInertia = () => {
    stopInertia();
    if (!wrapperWidth) return;
    
    const deltaTime = lastMoveTime - startVal || 1;
    const vpx = (startX - lastMoveX) / deltaTime;
    const vStart = (vpx * originalRange) / wrapperWidth;
    const startTime = performance.now();
    
    const anim = (currentTime) => {
      const dt = currentTime - startTime;
      const vCurrent = vStart * Math.exp(-damping * dt * 0.1);
      
      if (Math.abs(vCurrent * dt) < precisionStep / 100 && dt > 100) {
        rangeEl.value = getSnappedValue(+rangeEl.value);
        ticksEl.style.transition = SLIDER_TRANSITION;
        updatePosition();
        rangeEl.dispatchEvent(new Event('input', { bubbles: true }));
        rangeEl.dispatchEvent(new Event('change', { bubbles: true }));
        return;
      }
      
      let newValue = +rangeEl.value + vCurrent * dt;
      rangeEl.value = Math.max(min, Math.min(max, newValue));
      updatePosition();
      rangeEl.dispatchEvent(new Event('input', { bubbles: true }));
      inertiaID = requestAnimationFrame(anim);
    };
    inertiaID = requestAnimationFrame(anim);
  };

  const pointerDown = e => {
    if (e.button !== 0) return;
    e.preventDefault();
    stopInertia();
    
    rangeEl._isPointerDragging = true;
    startX = lastMoveX = e.clientX;
    startVal = +rangeEl.value;
    lastMoveTime = performance.now();
    wrapperWidth = wrapper.offsetWidth;
    ticksEl.style.transition = 'none';
    
    const pointerMove = e => {
      e.preventDefault();
      const now = performance.now();
      const dx = startX - e.clientX;
      if (wrapperWidth) {
        rangeEl.value = startVal + (dx / wrapperWidth) * originalRange;
        updatePosition();
        rangeEl.dispatchEvent(new Event('input', { bubbles: true }));
      }
      lastMoveX = e.clientX;
      lastMoveTime = now;
    };
    
    const pointerUp = e => {
      document.removeEventListener('pointermove', pointerMove);
      document.removeEventListener('pointerup', pointerUp);
      rangeEl._isPointerDragging = false;
      
      if (e.type !== 'pointercancel' && (performance.now() - lastMoveTime < 200)) {
        applyInertia();
      } else {
        rangeEl.value = getSnappedValue(+rangeEl.value);
        ticksEl.style.transition = SLIDER_TRANSITION;
        updatePosition();
        rangeEl.dispatchEvent(new Event('change', { bubbles: true }));
      }
    };
    
    document.addEventListener('pointermove', pointerMove);
    document.addEventListener('pointerup', pointerUp);
  };

  wrapper.addEventListener('pointerdown', pointerDown, { capture: true });
  rangeEl._sliderPointerDownHandler = pointerDown;
}

export function cleanupSlidingTicks(rangeEl) {
  const wrapper = rangeEl.closest(SLIDER_WRAPPER_CLASS);
  if (wrapper && rangeEl._sliderPointerDownHandler) {
    wrapper.removeEventListener('pointerdown', rangeEl._sliderPointerDownHandler, { capture: true });
  }
  
  const ticksEl = wrapper?.querySelector(TICKS_CLASS);
  if (ticksEl) ticksEl.innerHTML = '';
  
  delete rangeEl._sliderPointerDownHandler;
  delete rangeEl._isPointerDragging;
}