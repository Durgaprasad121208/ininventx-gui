'use client';

import React, { useState } from 'react';
import { Layout, Avatar, Dropdown, Badge, Popover, Breadcrumb, type MenuProps } from 'antd';
import {
  Bell,
  Sun,
  Moon,
  ChevronRight,
  Menu as MenuIcon,
  PanelLeft,
  PanelLeftClose,
  User as UserIcon,
  Settings,
  LogOut,
  HelpCircle,
  ShieldAlert,
  Clock,
  CheckCheck,
} from 'lucide-react';
import Link from 'next/link';
import { useTheme } from '@/providers/theme/ThemeProvider';
import styles from './Header.module.css';

const { Header: AntdHeader } = Layout;

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface HeaderUser {
  name: string;
  role: string;
  company: string;
  initials: string;
  avatarUrl?: string;
}

export interface HeaderProps {
  breadcrumbItems?: BreadcrumbItem[];
  user?: HeaderUser;
  notificationCount?: number;
  onMenuToggle?: () => void;
  collapsed?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const Header: React.FC<HeaderProps> = ({
  breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Dashboard' },
  ],
  user = {
    name: 'Aarav Mehta (Demo)',
    role: 'Employee',
    company: 'MANTIX',
    initials: 'AM',
  },
  notificationCount: initialNotificationCount = 6,
  onMenuToggle,
  collapsed = false,
  className,
  style,
}) => {
  const { themeMode, mounted, toggleTheme } = useTheme();
  const [unreadCount, setUnreadCount] = useState<number>(initialNotificationCount);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Demo notifications list
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'High temperature alert on Compressor C-201',
      time: '10m ago',
      unread: true,
      icon: <ShieldAlert size={16} color="#ef4444" />,
    },
    {
      id: 2,
      title: 'Routine inspection due for Pump P-101',
      time: '45m ago',
      unread: true,
      icon: <Clock size={16} color="#f59e0b" />,
    },
    {
      id: 3,
      title: 'Maintenance schedule completed by Tech Team A',
      time: '2h ago',
      unread: false,
      icon: <CheckCheck size={16} color="#10b981" />,
    },
  ]);

  const handleMarkAllAsRead = () => {
    setUnreadCount(0);
    setNotifications((prev) => (prev || []).map((n) => ({ ...n, unread: false })));
  };

  // User Dropdown items
  const userMenuItems: MenuProps['items'] = [
    {
      key: 'user-summary',
      type: 'group',
      label: (
        <div style={{ padding: '2px 0' }}>
          <div style={{ fontWeight: 600, color: 'var(--color-text-primary, #ffffff)', fontSize: 12 }}>
            {user?.name || 'User'}
          </div>
          <div style={{ fontSize: 10.5, color: 'var(--color-text-secondary, #94a3b8)' }}>
            {user?.role || 'Employee'} · {user?.company || 'MANTIX'}
          </div>
        </div>
      ),
    },
    { type: 'divider' },
    {
      key: 'profile',
      icon: <UserIcon size={16} />,
      label: (
        <Link href="/profile" style={{ textDecoration: 'none', color: 'inherit' }}>
          My Profile
        </Link>
      ),
    },
    {
      key: 'settings',
      icon: <Settings size={16} />,
      label: 'Account Settings',
    },
    {
      key: 'help',
      icon: <HelpCircle size={16} />,
      label: 'Documentation & Support',
    },
    { type: 'divider' },
    {
      key: 'logout',
      danger: true,
      icon: <LogOut size={16} />,
      label: 'Sign Out',
    },
  ];

  // Notifications Popover content
  const notificationsContent = (
    <div className={styles.notificationsPanel}>
      <div className={styles.notificationsHeader}>
        <span className={styles.notificationsTitle}>Notifications</span>
        {unreadCount > 0 && (
          <span
            className={styles.notificationsMarkRead}
            onClick={handleMarkAllAsRead}
            role="button"
            tabIndex={0}
          >
            Mark all read
          </span>
        )}
      </div>
      <div className={styles.notificationsList}>
        {(notifications || []).map((item) => (
          <div key={item.id} className={styles.notificationItem}>
            <div>{item.icon}</div>
            <div className={styles.notificationContent}>
              <div className={styles.notificationText}>{item.title}</div>
              <div className={styles.notificationTime}>{item.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const safeBreadcrumbItems = Array.isArray(breadcrumbItems) && breadcrumbItems.length > 0
    ? breadcrumbItems
    : [{ label: 'Home', href: '/user-dashboard' }, { label: 'Dashboard' }];

  return (
    <AntdHeader
      className={`${styles.header} ${className || ''}`}
      style={{
        backgroundColor: 'var(--color-header-bg, #050812)',
        ...style,
      }}
    >
      {/* Left: Sidebar Toggle & Breadcrumb Navigation using Ant Design Breadcrumb */}
      <div className={styles.leftSection}>
        {onMenuToggle && (
          <button
            type="button"
            className={styles.sidebarToggleBtn}
            onClick={onMenuToggle}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <PanelLeft size={18} strokeWidth={2} />
            ) : (
              <PanelLeftClose size={18} strokeWidth={2} />
            )}
          </button>
        )}

        <Breadcrumb
          separator={<ChevronRight size={13} style={{ color: '#64748b' }} />}
          className={styles.breadcrumbWrapper}
          items={safeBreadcrumbItems.map((item, index) => {
            const isLast = index === safeBreadcrumbItems.length - 1;
            return {
              key: `${item?.label || index}`,
              title:
                item?.href && !isLast ? (
                  <Link href={item.href} className={styles.breadcrumbItem}>
                    {item.label}
                  </Link>
                ) : (
                  <span className={isLast ? styles.breadcrumbActive : styles.breadcrumbItem}>
                    {item?.label}
                  </span>
                ),
            };
          })}
        />
      </div>

      {/* Right: Actions (Notification, Theme, User Profile) */}
      <div className={styles.rightSection}>
        {/* Notifications Popover */}
        <Popover
          content={notificationsContent}
          trigger="click"
          placement="bottomRight"
          open={isNotificationsOpen}
          onOpenChange={setIsNotificationsOpen}
          arrow={false}
        >
          <button
            type="button"
            className={styles.actionIconBtn}
            aria-label={`Notifications (${unreadCount} unread)`}
          >
            <Badge
              count={unreadCount}
              offset={[2, -2]}
              className={styles.notificationBadge}
            >
              <Bell size={18} />
            </Badge>
          </button>
        </Popover>

        {/* Theme Toggle (Sun / Moon) */}
        <button
          type="button"
          className={styles.actionIconBtn}
          onClick={toggleTheme}
          aria-label={mounted ? `Switch to ${themeMode === 'dark' ? 'light' : 'dark'} mode` : 'Switch theme'}
          title={mounted ? `Switch to ${themeMode === 'dark' ? 'light' : 'dark'} mode` : 'Switch theme'}
          suppressHydrationWarning
        >
          {mounted && themeMode === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        {/* User Profile Pill with Dropdown */}
        <Dropdown
          menu={{ items: userMenuItems }}
          trigger={['click']}
          placement="bottomRight"
          arrow={false}
        >
          <div
            className={styles.userProfileTrigger}
            role="button"
            tabIndex={0}
            aria-haspopup="true"
            aria-label="User account menu"
          >
            <Avatar
              size={36}
              src={user.avatarUrl}
              className={styles.avatar}
            >
              {user.initials}
            </Avatar>

            <div className={styles.userInfo}>
              <span className={styles.userName}>{user.name}</span>
              <span className={styles.userSubtitle}>
                {user.role} · {user.company}
              </span>
            </div>
          </div>
        </Dropdown>
      </div>
    </AntdHeader>
  );
};

export default Header;
