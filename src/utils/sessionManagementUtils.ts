import { z } from "zod";
import { DeviceType, UserDeviceType } from "@/lib/constants";

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

export function getOs(ua: string): string {
  return ua.split("OS:")[1].trim();
}

export function getDevice(ua: string): string {
  return ua.split("Device:")[1].split("DeviceType:")[0].trim();
}

export function getDeviceType(ua: string): UserDeviceType {
  const uaDeviceType = ua.split("DeviceType:")[1].split("OS:")[0].trim();
  if (uaDeviceType) {
    switch (uaDeviceType) {
      case DeviceType.mobile:
        return DeviceType.mobile;
      case DeviceType.tablet:
        return DeviceType.tablet;
      case DeviceType.smarttv:
        return DeviceType.smarttv;
      default:
        return DeviceType.desktop;
    }
  }

  const os = ua.split("OS:")[1].trim();
  const device = ua.split("Device:")[1].split("DeviceType:")[0].trim();
  if (
    os.toLowerCase().includes("android") ||
    os.toLowerCase().includes("ios")
  ) {
    if (
      device.toLowerCase().includes("tab") ||
      device.toLowerCase().includes("ipad")
    ) {
      return DeviceType.tablet;
    }
    return DeviceType.mobile;
  }

  return DeviceType.desktop;
}
