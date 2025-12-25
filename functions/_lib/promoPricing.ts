export function computePromotionPrice({ type, billing, quantity }) {
  const qty = Math.max(1, Math.floor(Number(quantity) || 1));
  const table = {
    featured: { day: 2.99, week: 3.99 },
    top: { day: 4.99, week: 9.99 }
  };
  if (!table[type] || !table[type][billing]) throw new Error('Unsupported plan');
  const unit = table[type][billing];
  const amount = Number((unit * qty).toFixed(2));
  const durationDays = billing === 'day' ? qty : qty * 7;
  return { amount, currency: 'EUR', durationDays };
}