
export const getRandomColor = () => {
  const colors = [
    "#3b82f6",
    "#10b981",
    "#8b5cf6",
    "#f59e0b",
    "#ec4899",
    "#6366f1",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};
