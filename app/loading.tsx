import BlackHoleLoader from "@/components/BlackHoleLoader";

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
      <BlackHoleLoader label="Loading..." />
    </div>
  );
}
