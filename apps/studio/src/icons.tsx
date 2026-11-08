import type { ComponentType } from "react";
import {
  IconActivity,
  IconApi,
  IconBell,
  IconBolt,
  IconBook,
  IconBox,
  IconBug,
  IconCalendar,
  IconChartBar,
  IconClock,
  IconCloud,
  IconCode,
  IconCoin,
  IconDatabase,
  IconDeviceDesktop,
  IconDeviceMobile,
  IconFile,
  IconFlag,
  IconFolder,
  IconGitBranch,
  IconHeart,
  IconHelp,
  IconHome,
  IconKey,
  IconStack2,
  IconLock,
  IconMail,
  IconMessage,
  IconNotebook,
  IconPuzzle,
  IconRocket,
  IconRoute,
  IconSearch,
  IconServer,
  IconSettings,
  IconShield,
  IconShoppingCart,
  IconSitemap,
  IconSquare,
  IconStar,
  IconTarget,
  IconTestPipe,
  IconUser,
  IconWorld,
  IconWand,
} from "@tabler/icons-react";

export type TablerIcon = ComponentType<{ size?: number; color?: string; stroke?: number }>;

export const NODE_ICONS: Record<string, TablerIcon> = {
  IconActivity,
  IconApi,
  IconBell,
  IconBolt,
  IconBook,
  IconBox,
  IconBug,
  IconCalendar,
  IconChartBar,
  IconClock,
  IconCloud,
  IconCode,
  IconCoin,
  IconDatabase,
  IconDeviceDesktop,
  IconDeviceMobile,
  IconFile,
  IconFlag,
  IconFolder,
  IconGitBranch,
  IconHeart,
  IconHelp,
  IconHome,
  IconKey,
  IconStack2,
  IconLock,
  IconMail,
  IconMessage,
  IconNotebook,
  IconPuzzle,
  IconRocket,
  IconRoute,
  IconSearch,
  IconServer,
  IconSettings,
  IconShield,
  IconShoppingCart,
  IconSitemap,
  IconSquare,
  IconStar,
  IconTarget,
  IconTestPipe,
  IconUser,
  IconWorld,
  IconWand,
};

export const ICON_NAMES = Object.keys(NODE_ICONS);

export const ICON_COLORS = [
  "#f59e0b",
  "#3b82f6",
  "#10b981",
  "#8b5cf6",
  "#6366f1",
  "#ef4444",
  "#ec4899",
  "#14b8a6",
  "#f97316",
  "#a855f7",
];

export function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function defaultIconFor(id: string): string {
  return ICON_NAMES[hashString(id) % ICON_NAMES.length] ?? "IconFile";
}

export function iconComponent(name: string | undefined): TablerIcon {
  return (name && NODE_ICONS[name]) || NODE_ICONS.IconFile!;
}
