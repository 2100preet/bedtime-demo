export function serviceMode() {
  return {
    llm: process.env.OPENAI_API_KEY ? "openai" : "mock",
    voice: process.env.ELEVENLABS_API_KEY ? "elevenlabs" : "mock",
    image: process.env.IMAGE_API_KEY ? "image" : "mock",
    payments: process.env.STRIPE_SECRET_KEY ? "stripe" : "mock",
    photosDelete: process.env.PHOTO_DELETE_AFTER_GENERATION !== "false",
  } as const;
}

export function isPracticeMode() {
  const mode = serviceMode();
  return (
    mode.llm === "mock" ||
    mode.voice === "mock" ||
    mode.image === "mock" ||
    mode.payments === "mock"
  );
}
