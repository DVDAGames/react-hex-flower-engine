import { Box } from "@mantine/core";
import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface HexIconProps {
  icon: string;
  label?: string;
  size?: number;
}

/**
 * Map of icon names to Lucide components
 * Converts kebab-case to PascalCase for Lucide lookup
 */
function getIconComponent(iconName: string): LucideIcon | null {
  // Convert kebab-case to PascalCase
  const pascalCase = iconName
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");

  // Try to find the icon in Lucide
  const IconComponent = (LucideIcons as unknown as Record<string, LucideIcon>)[pascalCase];

  return IconComponent || null;
}

export function HexIcon({ icon, label, size = 24 }: HexIconProps) {
  const IconComponent = getIconComponent(icon);

  if (!IconComponent) {
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

  return <IconComponent size={size} aria-label={label} strokeWidth={1.5} />;
}

export default HexIcon;
