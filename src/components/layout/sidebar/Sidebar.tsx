'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Layout, Tooltip } from 'antd';
import {
  getMenuSectionsForRole,
  type MenuItem,
  type MenuSection,
} from '@/lib/data/menuConfig';
import { EMPLOYEE, type Role } from '@/lib/data/role';
import styles from './Sidebar.module.css';

const { Sider } = Layout;

export interface SidebarProps {
  role?: Role;
  currentPath?: string;
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
  onItemClick?: () => void;
  isDrawer?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const Sidebar: React.FC<SidebarProps> = ({
  role = EMPLOYEE,
  currentPath,
  collapsed = false,
  onCollapse,
  onItemClick,
  isDrawer = false,
  className,
  style,
}) => {
  const pathname = usePathname();
  const activePath = currentPath || pathname || '/submit-idea';
  const sections: MenuSection[] = getMenuSectionsForRole(role);

  const isItemActive = (itemKey: string): boolean => {
    if (activePath === itemKey) return true;
    if ((activePath === '/' || activePath === '/dashboard') && itemKey === '/user-dashboard') return true;
    if (activePath === '/user-dashboard' && itemKey === '/dashboard') return true;
    return false;
  };

  const handleItemClick = () => {
    if (onItemClick) {
      onItemClick();
    }
  };

  // Shared inner content: Brand header + Menu items + Footer
  const renderSidebarContent = () => (
    <>
      {/* Brand Header & Logo */}
      <Link
        href="/user-dashboard"
        className={styles.brandHeader}
        onClick={handleItemClick}
      >
        <div className={styles.logoIconWrapper}>
          <svg
            width="32"
            height="34"
            viewBox="0 0 32 36"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Lightbulb outline */}
            <path
              d="M16 2C9.925 2 5 6.925 5 13C5 17.15 7.3 20.76 10.65 22.58C11.15 22.85 11.5 23.38 11.5 23.95V26.5C11.5 27.33 12.17 28 13 28H19C19.83 28 20.5 27.33 20.5 26.5V23.95C20.5 23.38 20.85 22.85 21.35 22.58C24.7 20.76 27 17.15 27 13C27 6.925 22.075 2 16 2Z"
              stroke="#06b6d4"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Bulb base */}
            <path
              d="M12.5 31H19.5M14 34H18"
              stroke="#38bdf8"
              strokeWidth="2"
              strokeLinecap="round"
            />
            {/* Inner <x> code symbol */}
            <path
              d="M11 11.5L9.5 13L11 14.5"
              stroke="#f59e0b"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M21 11.5L22.5 13L21 14.5"
              stroke="#f59e0b"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M14 11.5L18 14.5M18 11.5L14 14.5"
              stroke="#38bdf8"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {(!collapsed || isDrawer) && (
          <div className={styles.brandTextWrapper}>
            <div className={styles.brandName}>
              <span className={styles.brandBracket}>&lt;</span>
              <span>invent</span>
              <span className={styles.brandHighlight}>/X</span>
              <span className={styles.brandBracket}>&gt;</span>
            </div>
            <div className={styles.brandTagline}>// where ideas switch on</div>
          </div>
        )}
      </Link>

      {/* Menu Navigation Items */}
      <div className={styles.menuContainer}>
        {sections.map((section) => (
          <div key={section.title} className={styles.menuSection}>
            {(!collapsed || isDrawer) && (
              <span className={styles.sectionTitle}>{section.title}</span>
            )}
            <ul className={styles.menuList}>
              {section.items.map((item: MenuItem) => {
                const active = isItemActive(item.key);
                const content = (
                  <Link
                    href={item.key}
                    onClick={handleItemClick}
                    className={`${styles.menuItem} ${active ? styles.menuItemActive : ''
                      }`}
                  >
                    <span className={styles.itemIcon}>{item.icon}</span>
                    {(!collapsed || isDrawer) && (
                      <>
                        <span className={styles.itemLabel}>{item.label}</span>
                        {item.badge && (
                          <span className={styles.itemBadge}>{item.badge}</span>
                        )}
                      </>
                    )}
                  </Link>
                );

                if (collapsed && !isDrawer) {
                  return (
                    <li key={item.key}>
                      <Tooltip placement="right" title={item.label}>
                        {content}
                      </Tooltip>
                    </li>
                  );
                }

                return <li key={item.key}>{content}</li>;
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom Footer Area */}
      {(!collapsed || isDrawer) && (
        <div className={styles.footerArea}>
          <div className={styles.footerCompany}>MANTIX · Nexsys · Stability</div>
          <div className={styles.footerTagline}>
            Bring your ideas. Build their impact.
          </div>
        </div>
      )}
    </>
  );

  // If inside Drawer on mobile, render as regular container with full width & height
  if (isDrawer) {
    return (
      <div
        className={`${styles.drawerSidebar} ${className || ''}`}
        style={style}
      >
        {renderSidebarContent()}
      </div>
    );
  }

  // Desktop/Tablet collapsible Sider
  return (
    <Sider
      width={250}
      collapsedWidth={76}
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      trigger={null}
      className={`${styles.sider} ${styles.desktopSider} ${collapsed ? styles.siderCollapsed : ''
        } ${className || ''}`}
      style={{
        backgroundColor: 'var(--color-header-bg, #050812)',
        ...style,
      }}
    >
      {renderSidebarContent()}
    </Sider>
  );
};

export default Sidebar;
