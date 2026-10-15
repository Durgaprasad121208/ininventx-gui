'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, Spin, App } from 'antd';
import { Pin, Clock, Share2 } from 'lucide-react';
import { getAnnouncements } from '../services/announcementsApi';
import type { AnnouncementItem } from '../types/announcements.types';
import styles from './Announcements.module.css';

/**
 * Format ISO publishedAt string into user-friendly date and time
 */
const formatAnnouncementDate = (isoString?: string): string => {
  if (!isoString) return 'Just now';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
};

export const Announcements: React.FC = () => {
  const { message } = App.useApp();
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAnnouncements();
      // Keep pinned announcements on top, followed by newest published date
      const sorted = [...data].sort((a, b) => {
        if (a.pinned !== b.pinned) {
          return a.pinned ? -1 : 1;
        }
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      });
      setAnnouncements(sorted);
    } catch (err) {
      console.error('[Announcements] Failed to fetch announcements:', err);
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const handleShare = (title: string) => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(`${title} - InventX Announcement`);
      message.success('Announcement text copied to clipboard');
    }
  };

  return (
    <div className={styles.container}>
      {/* 1. Page Header */}
      <div className={styles.headerSection}>
        <h1 className={styles.pageTitle}>Announcements</h1>
        <p className={styles.pageSubtitle}>
          Pinned updates appear first. Stay informed on submission dates and program milestones.
        </p>
      </div>

      {/* 2. Cards List with Loader */}
      <Spin spinning={loading} size="large" classNames={{ root: styles.spinWrapper }}>
        <div className={styles.cardsList}>
          {!loading && announcements.length === 0 ? (
            <div className={styles.emptyCard}>No announcements found.</div>
          ) : (
            announcements.map((item) => (
              <Card
                key={item.id}
                className={`${styles.announcementCard} ${item.pinned ? styles.cardPinned : ''}`}
                variant="borderless"
              >
                {/* Meta Top Row: Pinned badge, Date & Copy action */}
                <div className={styles.metaTopRow}>
                  {item.pinned && (
                    <span className={styles.pinnedBadge}>
                      <Pin size={10} />
                      <span>Pinned</span>
                    </span>
                  )}

                  <span className={styles.metaInfoText}>
                    <Clock size={12} style={{ color: '#64748b' }} />
                    <span>{formatAnnouncementDate(item.publishedAt)}</span>
                  </span>

                  <button
                    type="button"
                    className={styles.iconActionButton}
                    onClick={() => handleShare(item.title)}
                    title="Copy announcement"
                    aria-label="Copy announcement text"
                  >
                    <Share2 size={13} />
                  </button>
                </div>

                {/* Title */}
                <h2 className={styles.cardTitle}>{item.title}</h2>

                {/* Content description */}
                <p className={styles.cardContentText}>{item.content}</p>
              </Card>
            ))
          )}
        </div>
      </Spin>
    </div>
  );
};

export default Announcements;

