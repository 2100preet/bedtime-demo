export function InrNote({ currency }: { currency: string }) {
  if (currency !== "INR") return null;
  return <p className="text-center text-sm text-clay">Prices shown in INR</p>;
}
