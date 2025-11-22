/**
 * Utility functions for configuration management
 */

/**
 * Generate a unique configuration name
 * Appends a number to the base name if it already exists
 */
export function generateUniqueConfigName(
  baseName: string,
  configList: { name: string }[]
): string {
  if (!configList.some((config) => config.name === baseName)) {
    return baseName;
  }

  let counter = 1;
  let uniqueName = `${baseName} ${counter}`;

  while (configList.some((config) => config.name === uniqueName)) {
    counter++;
    uniqueName = `${baseName} ${counter}`;
  }

  return uniqueName;
}
