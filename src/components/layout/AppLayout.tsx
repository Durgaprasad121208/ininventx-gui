'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { Layout, Drawer } from 'antd';
import { Header, type BreadcrumbItem, type HeaderUser } from './header/Header';
import { Sidebar } from './sidebar/Sidebar';
import { EMPLOYEE, type Role } from '@/lib/data/role';

const { Content } = Layout;

export interface AppLayoutProps {
  children: React.ReactNode;
  role?: Role;
  breadcrumbItems?: BreadcrumbItem[];
  user?: HeaderUser;
  notificationCount?: number;
  currentPath?: string;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  role = EMPLOYEE,
  breadcrumbItems,
  user = {
    name: 'Priya',
    role: 'Employee',
    company: 'MANTIX',
    initials: 'P',
  },
  notificationCount = 6,
  currentPath,
}) => {
  const pathname = usePathname();
  const effectivePath = currentPath || pathname || '/user-dashboard';
  const effectiveBreadcrumbs: BreadcrumbItem[] =
    Array.isArray(breadcrumbItems) && breadcrumbItems.length > 0
      ? breadcrumbItems
      : effectivePath === '/browse-ideas'
      ? [{ label: 'Home', href: '/user-dashboard' }, { label: 'Browse ideas' }]
      : effectivePath === '/submit-idea'
      ? [{ label: 'Home', href: '/user-dashboard' }, { label: 'Submit idea' }]
      : effectivePath === '/my-ideas'
      ? [{ label: 'Home', href: '/user-dashboard' }, { label: 'My ideas' }]
      : [{ label: 'Home', href: '/user-dashboard' }, { label: 'Dashboard' }];
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState<boolean>(false);
  const [isMobileOrTablet, setIsMobileOrTablet] = useState<boolean>(false);

  useEffect(() => {
    const handleResize = () => {
      // iPad Mini is 744px or 768px, tablets are up to 1024px
      const isNarrow = window.innerWidth <= 1024;
      setIsMobileOrTablet(isNarrow);
      if (isNarrow) {
        setCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMenuToggle = useCallback(() => {
    // iPad Mini (744px / 768px), tablets (<= 1024px), and mobile always open the slide-out drawer
    if (window.innerWidth <= 1024) {
      setMobileDrawerOpen((prev) => !prev);
    } else {
      // Desktop (> 1024px) collapses/expands the docked sidebar
      setCollapsed((prev) => !prev);
    }
  }, []);

  return (
    <Layout
      hasSider
      style={{
        height: '100vh',
        maxHeight: '100vh',
        overflow: 'hidden',
        backgroundColor: 'var(--color-body-bg, #030712)',
      }}
    >
      {/* Desktop Docked Sidebar (Hidden on <= 1024px: iPad Mini, Tablet, Mobile) */}
      <Sidebar
        role={role}
        collapsed={collapsed}
        onCollapse={setCollapsed}
        currentPath={effectivePath}
      />

      {/* Slide-out Drawer for iPad Mini, Tablet & Mobile */}
      <Drawer
        placement="left"
        closable={false}
        open={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        size={260}
        styles={{
          body: {
            padding: 0,
            backgroundColor: '#050812',
            height: '100%',
          },
          mask: {
            backdropFilter: 'blur(3px)',
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
          },
        }}
      >
        <Sidebar
          role={role}
          isDrawer={true}
          currentPath={effectivePath}
          onItemClick={() => setMobileDrawerOpen(false)}
        />
      </Drawer>

      {/* Main Column: Pinned Header + Scrollable Content ONLY */}
      <Layout
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          maxHeight: '100vh',
          minWidth: 0,
          background: 'transparent',
          flex: 1,
          overflow: 'hidden',
        }}
      >
        {/* Pinned Header at top */}
        <Header
          collapsed={collapsed}
          breadcrumbItems={effectiveBreadcrumbs}
          user={user}
          notificationCount={notificationCount}
          onMenuToggle={handleMenuToggle}
        />

        {/* Scrollable Content Area ONLY */}
        <Content
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            height: 'calc(100vh - 64px)',
            WebkitOverflowScrolling: 'touch',
            padding: '24px 20px',
            width: '100%',
          }}
        >
          <div
            style={{
              maxWidth: '1440px',
              margin: '0 auto',
              width: '100%',
              minHeight: '100%',
            }}
          >
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
