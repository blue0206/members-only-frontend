import { z } from "zod";

export function isValidIp(ip: string): boolean {
  const ipSchema = z.string().ip();

  const validatedIp = ipSchema.safeParse(ip);
  return validatedIp.success;
}

// UA string format returned from backend:
// Browser: Chrome 137.0.0.0 Device: Apple Macintosh DeviceType: OS: macOS 10.15.7

export function getBrowser(ua: string): string {
  return ua.split("Browser:")[1].split("Device:")[0].trim();
}
