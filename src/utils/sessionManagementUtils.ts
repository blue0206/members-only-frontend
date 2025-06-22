import { z } from "zod";

export function isValidIp(ip: string): boolean {
  const ipSchema = z.string().ip();

  const validatedIp = ipSchema.safeParse(ip);
  return validatedIp.success;
}
