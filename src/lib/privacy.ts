import { BRAND_NAME } from "@/lib/brand";

export function voiceConsentStatement() {
  return `I am the person being recorded. I agree that ${BRAND_NAME} may create a private voice model from this recording and use it only to narrate stories for this family. My voice will not be sold, shared, or used to train public models. I can ask for the voice to be deleted at any time.`;
}

export function photoConsentStatement() {
  return `I am the parent or legal guardian of this child. I agree that ${BRAND_NAME} may use these photos only to draw a stylized cartoon for this one birthday comic. You can preview that cartoon and ask for another drawing before the full book is created. The photos will be deleted after the book is created, will not be used to train AI models, and will not appear in any public gallery.`;
}
