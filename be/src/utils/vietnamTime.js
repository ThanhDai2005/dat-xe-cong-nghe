const vietnamDayBounds = (dateStr) => {
  if (!dateStr) {
    const now = new Date();
    const dStr = now.toISOString().slice(0, 10);
    return [
      `${dStr} 00:00:00`,
      `${dStr} 23:59:59`,
    ];
  }
  return [
    `${dateStr} 00:00:00`,
    `${dateStr} 23:59:59`,
  ];
};

module.exports = { vietnamDayBounds };
