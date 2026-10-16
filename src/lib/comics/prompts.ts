/** Prompts for photo-referenced cartoon generation. Identity cues stay stable across the book. */
export function characterSheetPrompt(childName: string, variant: number) {
  const pose =
    variant % 2 === 0
      ? "Head and shoulders, facing the viewer, with a gentle smile."
      : "Three-quarter view, a bigger delighted smile, one hand raised in a small wave.";
  return [
    `A character sheet of ${childName}, one toddler, in a warm Pixar-like 3D storybook cartoon.`,
    "Soft studio light, plain warm cream background.",
    "Match the reference photo: the same face shape, the same skin tone, the same hair color and style, and the same eye shape and color.",
    pose,
    "Not a photograph. No text. No watermark. One child only.",
  ].join(" ");
}

export function panelPrompt(childName: string, caption: string) {
  return [
    `Children's picture-book panel of ${childName}, warm Pixar-like 3D storybook cartoon.`,
    "The child must match the reference character sheet: the same face shape, the same skin tone, the same hair, and the same eyes.",
    `Scene: ${caption}.`,
    "A loved one may appear in a soft shawl. Not a photograph. No text, no letters, no watermark.",
  ].join(" ");
}
