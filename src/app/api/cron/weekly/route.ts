import { getCurrentUser } from "@/lib/auth";
import { runWeeklyJob } from "@/lib/jobs/weekly";
import { fail, ok } from "@/lib/http";

export async function POST(request: Request) {
  const header = request.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  const bearerOk = Boolean(secret) && header === `Bearer ${secret}`;
  const user = await getCurrentUser();
  const devOk = process.env.NODE_ENV !== "production" && Boolean(user);
  if (!bearerOk && !devOk) return fail("Unauthorized", 401);
  const report = await runWeeklyJob();
  return ok(report);
}
