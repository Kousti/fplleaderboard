export const CM_IMAGE_BASE = "https://image1.challengermode.com";

export function teamLogoUrl(imageId: string, size = 64): string {
  return `${CM_IMAGE_BASE}/${imageId}_${size}_${size}`;
}
