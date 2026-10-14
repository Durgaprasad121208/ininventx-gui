import React from 'react';
import {
  LayoutGrid,
  Lightbulb,
  PlusCircle,
  Folder,
  Megaphone,
  BookOpen,
  User,
  CheckSquare,
  Trophy,
  BarChart3,
  Settings,
} from 'lucide-react';
import { EMPLOYEE, ORGANISER, Role } from './role';

export interface MenuItem {
  key: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  badge?: string | number;
  roles?: Role[];
  children?: MenuItem[];
}

export interface MenuSection {
  title: string;
  roles?: Role[];
  items: MenuItem[];
}

export const ICON_SIZE = 18;

// ============================================================================
// INVENT/X IDEA MANAGEMENT MENU CONFIGURATION
// ============================================================================
export const inventxMenuSections: MenuSection[] = [
  {
    title: 'PARTICIPATE',
    roles: [EMPLOYEE, ORGANISER],
    items: [
      {
        key: '/user-dashboard',
        label: 'Dashboard',
        icon: React.createElement(LayoutGrid, { size: ICON_SIZE, strokeWidth: 1.8 }),
        roles: [EMPLOYEE, ORGANISER],
      },
      {
        key: '/browse-ideas',
        label: 'Browse ideas',
        icon: React.createElement(Lightbulb, { size: ICON_SIZE, strokeWidth: 1.8 }),
        roles: [EMPLOYEE, ORGANISER],
      },
      {
        key: '/submit-idea',
        label: 'Submit idea',
        icon: React.createElement(PlusCircle, { size: ICON_SIZE, strokeWidth: 1.8 }),
        roles: [EMPLOYEE, ORGANISER],
      },
      {
        key: '/my-ideas',
        label: 'My ideas',
        icon: React.createElement(Folder, { size: ICON_SIZE, strokeWidth: 1.8 }),
        roles: [EMPLOYEE, ORGANISER],
      },
      {
        key: '/announcements',
        label: 'Announcements',
        icon: React.createElement(Megaphone, { size: ICON_SIZE, strokeWidth: 1.8 }),
        roles: [EMPLOYEE, ORGANISER],
      },
      {
        key: '/guidelines',
        label: 'Guidelines',
        icon: React.createElement(BookOpen, { size: ICON_SIZE, strokeWidth: 1.8 }),
        roles: [EMPLOYEE, ORGANISER],
      },
      {
        key: '/profile',
        label: 'Profile',
        icon: React.createElement(User, { size: ICON_SIZE, strokeWidth: 1.8 }),
        roles: [EMPLOYEE, ORGANISER],
      },
    ],
  },
  {
    title: 'ORGANISER',
    roles: [ORGANISER],
    items: [
      {
        key: '/manage/review-ideas',
        label: 'Review ideas',
        icon: React.createElement(CheckSquare, { size: ICON_SIZE, strokeWidth: 1.8 }),
        badge: 'New',
        roles: [ORGANISER],
      },
      {
        key: '/manage/challenges',
        label: 'Challenges & themes',
        icon: React.createElement(Trophy, { size: ICON_SIZE, strokeWidth: 1.8 }),
        roles: [ORGANISER],
      },
      {
        key: '/manage/analytics',
        label: 'Analytics & reports',
        icon: React.createElement(BarChart3, { size: ICON_SIZE, strokeWidth: 1.8 }),
        roles: [ORGANISER],
      },
      {
        key: '/manage/settings',
        label: 'Settings',
        icon: React.createElement(Settings, { size: ICON_SIZE, strokeWidth: 1.8 }),
        roles: [ORGANISER],
      },
    ],
  },
];

/**
 * Returns the relevant menu sections filtered according to the active user role.
 * Supports EMPLOYEE and ORGANISER roles.
 */
export const getMenuSectionsForRole = (role: string = EMPLOYEE): MenuSection[] => {
  if (!role) return inventxMenuSections;
  const normalized = role.toUpperCase().replace(/\s+/g, '_');

  return inventxMenuSections
    .filter(
      (section) =>
        !section.roles ||
        section.roles.some((r) => r.toUpperCase() === normalized)
    )
    .map((section) => ({
      ...section,
      items: section.items.filter(
        (item) =>
          !item.roles ||
          item.roles.some((r) => r.toUpperCase() === normalized)
      ),
    }))
    .filter((section) => section.items.length > 0);
};

export const menuSections: MenuSection[] = inventxMenuSections;
export default menuSections;

/**
 * Finds the corresponding menu item and its parent section for a given path.
 */
export const findMenuItemByPath = (
  path?: string | null
): { item?: MenuItem; section?: MenuSection } => {
  if (!path) return {};
  for (const section of inventxMenuSections) {
    const found = section.items.find(
      (item) =>
        item.key === path ||
        ((path === '/' || path === '/dashboard' || path === '/user-dashboard') && item.key === '/user-dashboard') ||
        (path !== '/' && (item.key.endsWith(path) || path.endsWith(item.key)))
    );
    if (found) {
      return { item: found, section };
    }
  }
  return {};
};
