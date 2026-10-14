'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Card, Input, App } from 'antd';
import {
  Pin,
  AlertTriangle,
  Clock,
  Search,
  Share2,
  Bookmark,
  Calendar,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { SubmitButton, DarkButton } from '@/components/ui/app-button/AppButton';
import { getAnnouncements } from '../services/announcementsApi';
import type { AnnouncementItem, AnnouncementPriority } from '../types/announcements.types';
import styles from './Announcements.module.css';

export const Announcements: React.FC = () => {
  const { message } = App.useApp();
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'pinned' | 'critical' | 'important'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarkedMap, setBookmarkedMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    getAnnouncements().then((data) => {
      setAnnouncements(data);
    });
  }, []);

  const handleToggleBookmark = (id: string) => {
    setBookmarkedMap((prev) => {
      const isBookmarked = !prev[id];
      message.info(isBookmarked ? 'Announcement bookmarked' : 'Bookmark removed');
      return { ...prev, [id]: isBookmarked };
    });
  };

  const handleShare = (title: string) => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(`${title} - InventX Announcement`);
      message.success('Announcement text copied to clipboard');
    }
  };

  const filteredAnnouncements = useMemo(() => {
    let result = [...announcements];

    // Tab filter
    if (activeFilter === 'pinned') {
      result = result.filter((item) => item.isPinned);
    } else if (activeFilter === 'critical') {
      result = result.filter((item) => item.priority === 'critical');
    } else if (activeFilter === 'important') {
      result = result.filter((item) => item.priority === 'important');
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.content.toLowerCase().includes(q) ||
          item.author.toLowerCase().includes(q)
      );
    }

    return result;
  }, [announcements, activeFilter, searchQuery]);

  const getPriorityBadge = (priority: AnnouncementPriority) => {
    switch (priority) {
      case 'critical':
        return (
          <span className={styles.priorityCriticalBadge}>
            <AlertTriangle size={11} />
            <span>critical</span>
          </span>
        );
      case 'important':
        return (
          <span className={styles.priorityImportantBadge}>
            <span>important</span>
          </span>
        );
      case 'general':
        return (
          <span className={styles.priorityGeneralBadge}>
            <span>general</span>
          </span>
        );
      default:
        return null;
    }
  };

  const getCardPriorityClass = (item: AnnouncementItem) => {
    if (item.priority === 'critical') return styles.cardCritical;
    if (item.priority === 'important') return styles.cardImportant;
    if (item.isPinned) return styles.cardPinned;
    return '';
  };

  return (
    <div className={styles.container}>
      {/* 1. Page Header */}
      <div className={styles.headerSection}>
        <h1 className={styles.pageTitle}>Announcements</h1>
        <p className={styles.pageSubtitle}>
          Pinned and important updates appear first. Stay informed on submission dates and program milestones.
        </p>
      </div>

      {/* 2. Enhanced Filter & Search Toolbar */}
      <div className={styles.toolbarRow}>
        <div className={styles.filterTabs}>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeFilter === 'all' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            <span>All updates</span>
            <span className={styles.tabCount}>{announcements.length}</span>
          </button>

          <button
            type="button"
            className={`${styles.tabBtn} ${activeFilter === 'pinned' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveFilter('pinned')}
          >
            <Pin size={12} />
            <span>Pinned</span>
            <span className={styles.tabCount}>
              {announcements.filter((a) => a.isPinned).length}
            </span>
          </button>

          <button
            type="button"
            className={`${styles.tabBtn} ${activeFilter === 'critical' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveFilter('critical')}
          >
            <AlertTriangle size={12} />
            <span>Critical</span>
            <span className={styles.tabCount}>
              {announcements.filter((a) => a.priority === 'critical').length}
            </span>
          </button>

          <button
            type="button"
            className={`${styles.tabBtn} ${activeFilter === 'important' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveFilter('important')}
          >
            <span>Important</span>
            <span className={styles.tabCount}>
              {announcements.filter((a) => a.priority === 'important').length}
            </span>
          </button>
        </div>

        <Input
          prefix={<Search size={14} style={{ color: '#64748b', marginRight: 4 }} />}
          placeholder="Filter announcements..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          allowClear
          className={styles.searchInput}
        />
      </div>

      {/* 3. Cards List with Guaranteed 20px Gap */}
      <div className={styles.cardsList}>
        {filteredAnnouncements.length === 0 ? (
          <div className={styles.emptyCard}>No announcements found matching your criteria.</div>
        ) : (
          filteredAnnouncements.map((item) => {
            const isBookmarked = Boolean(bookmarkedMap[item.id]);

            return (
              <Card
                key={item.id}
                className={`${styles.announcementCard} ${getCardPriorityClass(item)}`}
                variant="borderless"
              >
                {/* Meta Row: Pinned badge, Priority badge, Date, Author */}
                <div className={styles.metaTopRow}>
                  {item.isPinned && (
                    <span className={styles.pinnedBadge}>
                      <Pin size={10} />
                      <span>Pinned</span>
                    </span>
                  )}

                  {getPriorityBadge(item.priority)}

                  <span className={styles.metaInfoText}>
                    <Clock size={12} style={{ color: '#64748b' }} />
                    <span>{item.date}</span>
                    <span>·</span>
                    <span style={{ color: '#f1f5f9', fontWeight: 500 }}>{item.author}</span>
                    {item.authorRole && (
                      <span className={styles.authorRoleTag}>({item.authorRole})</span>
                    )}
                  </span>
                </div>

                {/* Title */}
                <h2 className={styles.cardTitle}>{item.title}</h2>

                {/* Content description */}
                <p className={styles.cardContentText}>{item.content}</p>

                {/* Key Milestones Timeline Chips (Enhancement) */}
                {item.milestones && item.milestones.length > 0 && (
                  <div className={styles.milestonesContainer}>
                    <div className={styles.milestonesHeader}>Key Program Milestones</div>
                    <div className={styles.milestonesList}>
                      {item.milestones.map((m, idx) => (
                        <div key={`${m.label}-${idx}`} className={styles.milestonePill}>
                          <span className={styles.milestoneDot} />
                          <span>{m.label}:</span>
                          <span className={styles.milestoneDate}>{m.date}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Highlights Tags */}
                {item.highlights && item.highlights.length > 0 && (
                  <div className={styles.highlightsList}>
                    {item.highlights.map((h, idx) => (
                      <span key={`${h}-${idx}`} className={styles.highlightTag}>
                        <CheckCircle2 size={11} style={{ color: '#29c9d1' }} />
                        <span>{h}</span>
                      </span>
                    ))}
                  </div>
                )}

                {/* Bottom Action Bar */}
                <div className={styles.cardFooter}>
                  {item.actionLink ? (
                    item.actionType === 'primary' ? (
                      <Link href={item.actionLink} style={{ textDecoration: 'none' }}>
                        <SubmitButton icon={<ArrowRight size={14} />}>
                          {item.actionText || 'Take action'}
                        </SubmitButton>
                      </Link>
                    ) : (
                      <Link href={item.actionLink} style={{ textDecoration: 'none' }}>
                        <DarkButton icon={<ArrowRight size={14} />}>
                          {item.actionText || 'Learn more'}
                        </DarkButton>
                      </Link>
                    )
                  ) : (
                    <div />
                  )}

                  <div className={styles.actionButtonsRight}>
                    <button
                      type="button"
                      className={styles.iconActionButton}
                      onClick={() => handleShare(item.title)}
                      title="Copy announcement"
                      aria-label="Copy announcement text"
                    >
                      <Share2 size={14} />
                    </button>

                    <button
                      type="button"
                      className={styles.iconActionButton}
                      onClick={() => handleToggleBookmark(item.id)}
                      title={isBookmarked ? 'Remove bookmark' : 'Bookmark announcement'}
                      aria-label="Bookmark"
                      style={{ color: isBookmarked ? '#29c9d1' : undefined }}
                    >
                      <Bookmark size={14} fill={isBookmarked ? '#29c9d1' : 'none'} />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Announcements;
