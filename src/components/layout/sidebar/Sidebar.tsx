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
import Image from 'next/image';
import inventxLogoWhite from '@/assets/inventx-logo-white.png';
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
      {/* Brand Header & Logo using inventx-logo-white.png */}
      <Link
        href="/user-dashboard"
        className={styles.brandHeader}
        onClick={handleItemClick}
      >
        {collapsed && !isDrawer ? (
          <div className={styles.logoIconWrapper}>
            <Image
              src={inventxLogoWhite}
              alt="invent/X"
              style={{ width: 'auto', height: '32px', objectFit: 'cover', objectPosition: 'left' }}
              priority
            />
          </div>
        ) : (
          <div className={styles.logoImgWrapper}>
            <Image
              src={inventxLogoWhite}
              alt="invent/X"
              style={{ width: 'auto', height: '36px', objectFit: 'contain' }}
              priority
            />
          </div>
        )}
      </Link>

      {/* Menu Navigation Items */}
      <div className={styles.menuContainer}>
        {(sections || []).map((section) => (
          <div key={section.title} className={styles.menuSection}>
            {(!collapsed || isDrawer) && (
              <span className={styles.sectionTitle}>{section.title}</span>
            )}
            <ul className={styles.menuList}>
              {(section?.items || []).map((item: MenuItem) => {
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
