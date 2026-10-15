'use client';

import React, { useState, useEffect } from 'react';
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
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { type RootState } from '@/redux/store';
import { logout } from '@/redux/slices/authSlice';
import { notify } from '@/utils/notify';
import { useTheme } from '@/providers/theme/ThemeProvider';
import styles from './Header.module.css';

const { Header: AntdHeader } = Layout;

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface HeaderUser {
  name?: string;
  role?: string;
  company?: string;
  initials?: string;
  avatarUrl?: string;
  email?: string;
  department?: string | null;
  designation?: string | null;
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
  user: propUser,
  notificationCount: initialNotificationCount = 6,
  onMenuToggle,
  collapsed = false,
  className,
  style,
}) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { themeMode, mounted, toggleTheme } = useTheme();
  const [unreadCount, setUnreadCount] = useState<number>(initialNotificationCount);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Retrieve user from Redux store
  const authState = useSelector((state: RootState) => state?.auth);
  const reduxUser = authState?.user || ((authState as any)?.id ? (authState as any) : null);

  const [isMounted, setIsMounted] = useState<boolean>(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Hydration fallback from localStorage
  const [localUser, setLocalUser] = useState<any>(null);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('inventx_user');
        if (stored) {
          setLocalUser(JSON.parse(stored));
        }
      } catch {
        // ignore
      }
    }
  }, []);

  const activeUser =
    reduxUser?.name || reduxUser?.email ? reduxUser : (localUser || propUser);

  const computeInitials = (name?: string): string => {
    if (!name) return '';
    const words = name.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) return '';
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  };

  const formatRole = (role?: string): string => {
    if (!role) return '';
    const upper = role.toUpperCase();
    if (upper === 'EMPLOYEE') return 'Employee';
    if (upper === 'ORGANISER' || upper === 'ORGANIZER') return 'Organizer';
    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  };

  const displayName = isMounted ? (activeUser?.name || 'User') : '';
  const displayRole = isMounted ? (formatRole(activeUser?.role) || 'Employee') : '';
  const displayCompany = isMounted ? (activeUser?.company || '') : '';
  const displayEmail = isMounted ? (activeUser?.email || '') : '';
  const displayInitials = isMounted ? (propUser?.initials || computeInitials(activeUser?.name || '')) : '';
  const displayAvatarUrl = isMounted ? (activeUser?.avatarUrl || activeUser?.avatar || propUser?.avatarUrl) : undefined;
  const displayDepartment = isMounted ? (activeUser?.department || '') : '';
  const displayDesignation = isMounted ? (activeUser?.designation || '') : '';

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    if (key === 'logout') {
      dispatch(logout());
      notify.info('You have been signed out');
      router.push('/login');
    }
  };

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
        <div style={{ padding: '4px 2px' }}>
          <div style={{ fontWeight: 600, color: 'var(--color-text-primary, #ffffff)', fontSize: 13 }}>
            {displayName}
          </div>
          {displayEmail && (
            <div style={{ fontSize: 11, color: 'var(--color-text-tertiary, #64748b)', marginTop: 2 }}>
              {displayEmail}
            </div>
          )}
          <div style={{ fontSize: 11, color: 'var(--color-text-secondary, #94a3b8)', marginTop: 3 }}>
            {displayRole}{displayCompany ? ` · ${displayCompany}` : ''}
          </div>
          {(displayDepartment || displayDesignation) && (
            <div style={{ fontSize: 10.5, color: 'var(--color-text-muted, #64748b)', marginTop: 2 }}>
              {[displayDesignation, displayDepartment].filter(Boolean).join(' | ')}
            </div>
          )}
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
          menu={{ items: userMenuItems, onClick: handleMenuClick }}
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
            suppressHydrationWarning
          >
            <Avatar
              size={36}
              src={displayAvatarUrl}
              className={styles.avatar}
            >
              <span suppressHydrationWarning>{displayInitials}</span>
            </Avatar>

            <div className={styles.userInfo} suppressHydrationWarning>
              <span className={styles.userName} suppressHydrationWarning>{displayName}</span>
              <span className={styles.userSubtitle} suppressHydrationWarning>
                {displayRole}{displayCompany ? ` · ${displayCompany}` : ''}
              </span>
            </div>
          </div>
        </Dropdown>
      </div>
    </AntdHeader>
  );
};

export default Header;
