'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { Layout, Drawer } from 'antd';
import { useSelector } from 'react-redux';
import { type RootState } from '@/redux/store';
import { Header, type BreadcrumbItem, type HeaderUser } from './header/Header';
import { Sidebar } from './sidebar/Sidebar';
import { EMPLOYEE, ORGANISER, type Role } from '@/lib/data/role';

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
  role: propRole,
  breadcrumbItems,
  user: propUser,
  notificationCount = 6,
  currentPath,
}) => {
  const authState = useSelector((state: RootState) => state?.auth);
  const reduxUser = authState?.user || ((authState as any)?.id ? (authState as any) : null);

  const rawRole = (reduxUser?.role || propRole || EMPLOYEE).toUpperCase();
  const effectiveRole: Role =
    rawRole === 'ORGANIZER' || rawRole === 'ORGANISER' ? ORGANISER : EMPLOYEE;

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
      : effectivePath.startsWith('/my-ideas/')
      ? [{ label: 'Home', href: '/user-dashboard' }, { label: 'My ideas', href: '/my-ideas' }, { label: 'Idea details' }]
      : effectivePath === '/announcements'
      ? [{ label: 'Home', href: '/user-dashboard' }, { label: 'Announcements' }]
      : effectivePath === '/guidelines'
      ? [{ label: 'Home', href: '/user-dashboard' }, { label: 'Guidelines' }]
      : effectivePath === '/profile'
      ? [{ label: 'Home', href: '/user-dashboard' }, { label: 'Profile' }]
      : effectivePath.startsWith('/organizer/manage-ideas/')
      ? [{ label: 'Home', href: '/user-dashboard' }, { label: 'Organizer', href: '/organizer/overview' }, { label: 'Manage ideas', href: '/organizer/manage-ideas' }, { label: 'Idea details' }]
      : effectivePath === '/organizer/manage-ideas'
      ? [{ label: 'Home', href: '/user-dashboard' }, { label: 'Organizer', href: '/organizer/overview' }, { label: 'Manage ideas' }]
      : effectivePath === '/organizer/guidelines'
      ? [{ label: 'Home', href: '/user-dashboard' }, { label: 'Organizer', href: '/organizer/overview' }, { label: 'Guidelines' }]
      : effectivePath === '/organizer/announcements'
      ? [{ label: 'Home', href: '/user-dashboard' }, { label: 'Organizer', href: '/organizer/overview' }, { label: 'Announcements' }]
      : effectivePath === '/organizer/users'
      ? [{ label: 'Home', href: '/user-dashboard' }, { label: 'Organizer', href: '/organizer/overview' }, { label: 'Users' }]
      : effectivePath === '/organizer/settings'
      ? [{ label: 'Home', href: '/user-dashboard' }, { label: 'Organizer', href: '/organizer/overview' }, { label: 'Settings' }]
      : effectivePath === '/idea-info' || effectivePath.startsWith('/idea-info')
      ? [{ label: 'Home', href: '/user-dashboard' }, { label: 'Idea details' }]
      : effectivePath.startsWith('/organizer')
      ? [{ label: 'Home', href: '/user-dashboard' }, { label: 'Organizer' }, { label: 'Overview' }]
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

  const isAuthPage = effectivePath === '/login' || effectivePath === '/register';
  if (isAuthPage) {
    return <main style={{ minHeight: '100vh', width: '100%', overflowX: 'hidden' }}>{children}</main>;
  }

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
        role={effectiveRole}
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
          role={effectiveRole}
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
          user={propUser}
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
