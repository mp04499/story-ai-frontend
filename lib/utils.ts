import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getEnv = () => ({
  LLM_URL: process.env.STORY_LLM_INFERENCE_URL,
});
