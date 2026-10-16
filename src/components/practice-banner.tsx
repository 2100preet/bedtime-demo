import { isPracticeMode } from "@/lib/services";

export function PracticeBanner() {
  if (!isPracticeMode()) return null;
  return (
    <div className="bg-blush px-4 py-2 text-center text-sm text-clay">
      Developer preview: stories, voices, pictures, and checkout run on this computer until API keys are added.
    </div>
  );
}
