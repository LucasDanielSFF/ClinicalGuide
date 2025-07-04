export function generateCardId() {
  return `card-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
}

window.removeCard = (cardId) => {
  document.getElementById(cardId)?.remove();
};
