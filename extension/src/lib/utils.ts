import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function processVideo(videoBlob: Blob): Promise<string> {
  await sleep(5000);
  return URL.createObjectURL(videoBlob);
}

function sleep(ms = 1000): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
