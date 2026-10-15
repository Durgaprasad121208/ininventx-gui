'use client';

/**
 * Centralized Notification Utility
 * =================================
 * A single-source notification system for the entire application.
 *
 * Usage from any file (no hooks required):
 *   import { notify } from '@/lib/utils/notification';
 *   notify.success('Dashboard saved!');
 *   notify.error('Failed to load data');
 *   notify.warning('Connection unstable');
 *   notify.info('New update available');
 *
 * The underlying antd message instance is injected at app root
 * via <NotificationProvider />, so calls work from anywhere —
 * components, Redux thunks, service files, callbacks, etc.
 */

import React, { useEffect } from 'react';
import { App } from 'antd';
import type { MessageInstance } from 'antd/es/message/interface';
import type { NotificationInstance } from 'antd/es/notification/interface';

// ---------------------------------------------------------------------------
// Internal references – set once by NotificationProvider
// ---------------------------------------------------------------------------
let messageApi: MessageInstance | null = null;
let notificationApi: NotificationInstance | null = null;

/** Called once from <NotificationProvider /> to wire up the antd instances. */
export function setNotifyInstances(
  msg: MessageInstance,
  ntf: NotificationInstance
) {
  messageApi = msg;
  notificationApi = ntf;
}

// ---------------------------------------------------------------------------
// NotificationProvider component to inject into root App
// ---------------------------------------------------------------------------
export const NotificationProvider: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  const { message, notification } = App.useApp();

  useEffect(() => {
    setNotifyInstances(message, notification);
  }, [message, notification]);

  return React.createElement(React.Fragment, null, children);
};

// ---------------------------------------------------------------------------
// Toast-style notifications (small, auto-dismiss) — antd `message` API
// ---------------------------------------------------------------------------
export interface NotifyOptions {
  /** Duration in seconds (default 3) */
  duration?: number;
  /** Unique key to prevent duplicate toasts */
  key?: string;
}

export const notify = {
  success(content: string, opts?: NotifyOptions) {
    richNotify.success(content, opts as RichNotifyOptions);
  },
  error(content: string, opts?: NotifyOptions) {
    richNotify.error(content, opts as RichNotifyOptions);
  },
  warning(content: string, opts?: NotifyOptions) {
    richNotify.warning(content, opts as RichNotifyOptions);
  },
  info(content: string, opts?: NotifyOptions) {
    richNotify.info(content, opts as RichNotifyOptions);
  },
  loading(content: string, opts?: NotifyOptions) {
    messageApi?.loading({ content, duration: opts?.duration ?? 0, key: opts?.key });
  },
  destroy(key?: string) {
    if (key) {
      messageApi?.destroy(key);
      notificationApi?.destroy(key);
    } else {
      messageApi?.destroy();
      notificationApi?.destroy();
    }
  },
};

// ---------------------------------------------------------------------------
// Rich notifications (title + description, positioned in corner)
// ---------------------------------------------------------------------------
export interface RichNotifyOptions {
  /** Duration in seconds (default 4.5, 0 = sticky) */
  duration?: number;
  /** Unique key */
  key?: string;
  /** Placement on screen */
  placement?: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
  /** Optional description below the title */
  description?: React.ReactNode;
}

export const richNotify = {
  success(title: string, opts?: RichNotifyOptions) {
    notificationApi?.success({
      title,
      description: opts?.description,
      duration: opts?.duration ?? 1,
      key: opts?.key,
      placement: opts?.placement ?? 'bottomRight',
    });
  },
  error(title: string, opts?: RichNotifyOptions) {
    notificationApi?.error({
      title,
      description: opts?.description,
      duration: opts?.duration ?? 1,
      key: opts?.key,
      placement: opts?.placement ?? 'bottomRight',
    });
  },
  warning(title: string, opts?: RichNotifyOptions) {
    notificationApi?.warning({
      title,
      description: opts?.description,
      duration: opts?.duration ?? 1,
      key: opts?.key,
      placement: opts?.placement ?? 'topRight',
    });
  },
  info(title: string, opts?: RichNotifyOptions) {
    notificationApi?.info({
      title,
      description: opts?.description,
      duration: opts?.duration ?? 1,
      key: opts?.key,
    });
  },
};

export default notify;
