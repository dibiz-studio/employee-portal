export function calcProgress(kpi: {
  current_value: number;
  target_value: number;
}) {
  if (kpi.target_value <= 0) return 0;
  return Math.min(
    100,
    Math.round((kpi.current_value / kpi.target_value) * 100),
  );
}
