import type { Variables } from "./types";

/**
 * Interpolates variables in a template string.
 * Replaces {{ variableName }} placeholders with actual values.
 *
 * @param template - Template string with {{ variable }} placeholders
 * @param variables - Object containing variable values
 * @returns Interpolated string
 *
 * @example
 * ```typescript
 * interpolate("Hello, {{ name }}!", { name: "John" })
 * // Returns: "Hello, John!"
 *
 * interpolate("You have {{ count }} messages", { count: 5 })
 * // Returns: "You have 5 messages"
 * ```
 */
export function interpolate(template: string, variables?: Variables): string {
  if (!variables || Object.keys(variables).length === 0) {
    return template;
  }

  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key) => {
    const value = variables[key];

    // If variable exists, convert to string
    if (value !== undefined && value !== null) {
      return String(value);
    }

    // If variable doesn't exist, keep the placeholder
    return match;
  });
}
