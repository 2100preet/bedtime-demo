import { z } from "zod";

export const emailField = z
  .string()
  .trim()
  .email("Enter a valid email")
  .max(200)
  .transform((value) => value.toLowerCase());

export const childSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, "A first name is enough")
    .max(40)
    .regex(/^[\p{L}][\p{L}\s.'’-]{0,39}$/u, "Use a first name only"),
  ageRange: z.enum(["2-3", "4-5", "6-7"]),
  language: z.enum(["english", "hindi", "telugu", "kannada", "hinglish", "tenglish", "kanglish"]),
  interests: z.string().trim().max(200).optional().default(""),
  nickname: z.string().trim().max(80).optional().default(""),
});

export const narratorSchema = z
  .object({
    childId: z.string().min(1).optional(),
    relationship: z.string().min(1),
    customLabel: z.string().trim().max(40).optional().default(""),
    displayName: z.string().trim().min(1, "What does your child call them?").max(40),
    language: z.enum(["english", "hindi", "telugu", "kannada", "hinglish", "tenglish", "kanglish"]),
  })
  .superRefine((value, ctx) => {
    if (value.relationship === "custom" && !value.customLabel) {
      ctx.addIssue({
        code: "custom",
        path: ["customLabel"],
        message: "Tell us who they are",
      });
    }
  });

export function firstZodError(error: z.ZodError) {
  return error.issues[0]?.message ?? "Check the form and try again";
}
