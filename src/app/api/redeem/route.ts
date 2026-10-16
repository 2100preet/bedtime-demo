import { getCurrentUser } from "@/lib/auth";
import { redeemGift } from "@/lib/checkout";
import { fail, ok } from "@/lib/http";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return fail("Sign in first", 401);
  const body = (await request.json().catch(() => null)) as { code?: string } | null;
  if (!body?.code) return fail("Enter the gift code");
  try {
    await redeemGift(body.code, user.id);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not open this gift");
  }
  return ok({ ok: true });
}
