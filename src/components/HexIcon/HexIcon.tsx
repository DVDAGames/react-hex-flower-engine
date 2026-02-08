import { Box } from "@mantine/core";
import * as LucideIcons from "lucide-react";
import { Icon } from "lucide-react";
import type { LucideIcon, IconNode } from "lucide-react";
import * as LucideLab from "@lucide/lab";

interface HexIconProps {
  icon: string;
  label?: string;
  size?: number;
}

/**
 * Convert kebab-case to PascalCase
 */
function toPascalCase(str: string): string {
  return str
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
}

/**
 * Convert kebab-case to camelCase (for Lucide Lab)
 */
function toCamelCase(str: string): string {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

/**
 * Get icon component from lucide-react
 */
function getLucideIcon(iconName: string): LucideIcon | null {
  const pascalCase = toPascalCase(iconName);
  const IconComponent = (LucideIcons as unknown as Record<string, LucideIcon>)[pascalCase];
  return IconComponent || null;
}

/**
 * Get icon node from @lucide/lab
 */
function getLabIconNode(iconName: string): IconNode | null {
  const camelCase = toCamelCase(iconName);
  const iconNode = (LucideLab as unknown as Record<string, IconNode>)[camelCase];
  return iconNode || null;
}

export function HexIcon({ icon, label, size = 24 }: HexIconProps) {
  // First try regular Lucide icons
  const IconComponent = getLucideIcon(icon);
  if (IconComponent) {
    return <IconComponent size={size} aria-label={label} strokeWidth={1.5} />;
  }

  // Then try Lucide Lab icons
  const labIconNode = getLabIconNode(icon);
  if (labIconNode) {
    return <Icon iconNode={labIconNode} size={size} aria-label={label} strokeWidth={1.5} />;
  }

  // Fallback: show icon name if not found
  return (
    <Box
      component="span"
      style={{
        fontSize: size * 0.5,
        opacity: 0.7,
      }}
    >
      {icon}
    </Box>
  );
}

export default HexIcon;
