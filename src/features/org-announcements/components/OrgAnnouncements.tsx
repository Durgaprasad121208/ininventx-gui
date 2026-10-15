'use client';

import React, { useState, useEffect } from 'react';
import { Card, Input, Select, Switch, Drawer, App, Popconfirm } from 'antd';
import {
  Plus,
  Send,
  Pin,
  Edit2,
  MessageCircle,
  Archive,
  Calendar,
} from 'lucide-react';
import { useTheme } from '@/providers/theme/ThemeProvider';
import { SubmitButton, CancelButton } from '@/components/ui/app-button/AppButton';
import {
  getOrgAnnouncements,
  createOrgAnnouncement,
  updateOrgAnnouncement,
  changeOrgAnnouncementState,
} from '../services/orgAnnouncementsApi';
import type { OrgAnnouncementItem } from '../types/orgAnnouncements.types';
import styles from './OrgAnnouncements.module.css';

const { TextArea } = Input;

/** Helper to convert DD-MM-YYYY HH:mm or other strings into an ISO string */
const formatPublishAtForApi = (input: string): string => {
  if (!input || !input.trim()) return new Date().toISOString();
  const match = input.trim().match(/^(\d{1,2})-(\d{1,2})-(\d{4})(?:\s+(\d{1,2}):(\d{1,2}))?$/);
  if (match) {
    const [, day, month, year, hour = '0', minute = '0'] = match;
    const d = new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute));
    if (!isNaN(d.getTime())) {
      return d.toISOString();
    }
  }
  const parsed = new Date(input);
  return !isNaN(parsed.getTime()) ? parsed.toISOString() : new Date().toISOString();
};

export const OrgAnnouncements: React.FC = () => {
  const { message } = App.useApp();
  const { themeMode } = useTheme();
  const isLight = themeMode === 'light';

  const [announcements, setAnnouncements] = useState<OrgAnnouncementItem[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<OrgAnnouncementItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formBody, setFormBody] = useState('');
  const [formPriority, setFormPriority] = useState('Normal');
  const [formPublishTime, setFormPublishTime] = useState('14-10-2026 22:31');
  const [formLink, setFormLink] = useState('');
  const [formPinToTop, setFormPinToTop] = useState(false);

  useEffect(() => {
    getOrgAnnouncements().then((data) => {
      setAnnouncements(data);
    });
  }, []);

  const handleOpenNew = () => {
    setEditingItem(null);
    setFormTitle('');
    setFormBody('');
    setFormPriority('Normal');
    setFormPublishTime('14-10-2026 22:31');
    setFormLink('');
    setFormPinToTop(false);
    setDrawerOpen(true);
  };

  const handleEdit = (item: OrgAnnouncementItem) => {
    setEditingItem(item);
    setFormTitle(item.title);
    setFormBody(item.content);
    setFormPriority(
      item.priority === 'critical'
        ? 'Critical'
        : item.priority === 'important'
          ? 'Important'
          : 'Normal'
    );
    setFormPublishTime(item.publishDate || (item.publishAt ? String(item.publishAt) : ''));
    setFormLink(item.link || '');
    setFormPinToTop(Boolean(item.isPinned ?? item.pinned));
    setDrawerOpen(true);
  };

  const handlePublish = async (id: string) => {
    try {
      await changeOrgAnnouncementState(id, 'PUBLISHED');
      setAnnouncements((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: 'published', state: 'PUBLISHED' } : item
        )
      );
      message.success('Announcement published successfully');
    } catch (error: any) {
      console.error('[OrgAnnouncements] Failed to publish announcement:', error);
      message.error(error?.response?.data?.message || error?.message || 'Failed to publish announcement');
    }
  };

  const handleTogglePin = async (id: string) => {
    const item = announcements.find((a) => a.id === id);
    if (!item) return;
    const nextPinned = !(item.isPinned ?? item.pinned);
    try {
      await updateOrgAnnouncement(id, {
        title: item.title,
        content: item.content,
        pinned: nextPinned,
        publishAt: formatPublishAtForApi(item.publishAt || item.publishDate || ''),
      });
      setAnnouncements((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, isPinned: nextPinned, pinned: nextPinned } : a
        )
      );
      message.success(nextPinned ? 'Announcement pinned to top' : 'Announcement unpinned');
    } catch (error: any) {
      console.error('[OrgAnnouncements] Failed to update pin status:', error);
      message.error(error?.response?.data?.message || error?.message || 'Failed to update pin status');
    }
  };

  const handleNotifyWhatsApp = (item: OrgAnnouncementItem) => {
    message.success(`WhatsApp notification triggered for: "${item.title}"`);
  };

  const handleArchive = async (id: string) => {
    try {
      await changeOrgAnnouncementState(id, 'ARCHIVED');
      setAnnouncements((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: 'archived', state: 'ARCHIVED' } : item
        )
      );
      message.success('Announcement moved to archive');
    } catch (error: any) {
      console.error('[OrgAnnouncements] Failed to archive announcement:', error);
      message.error(error?.response?.data?.message || error?.message || 'Failed to archive announcement');
    }
  };

  const handleSave = async () => {
    if (!formTitle.trim()) {
      message.warning('Please enter an announcement title');
      return;
    }

    const isoPublishAt = formatPublishAtForApi(formPublishTime);
    setIsSubmitting(true);

    try {
      if (editingItem) {
        const updated = await updateOrgAnnouncement(editingItem.id, {
          title: formTitle.trim(),
          content: formBody.trim(),
          pinned: formPinToTop,
          publishAt: isoPublishAt,
        });

        setAnnouncements((prev) =>
          prev.map((item) =>
            item.id === editingItem.id
              ? {
                  ...item,
                  ...(updated || {}),
                  title: formTitle.trim(),
                  content: formBody.trim(),
                  priority: formPriority.toLowerCase(),
                  publishDate: formPublishTime,
                  publishAt: isoPublishAt,
                  link: formLink || undefined,
                  isPinned: formPinToTop,
                  pinned: formPinToTop,
                }
              : item
          )
        );
        message.success('Announcement updated successfully');
      } else {
        const created = await createOrgAnnouncement({
          title: formTitle.trim(),
          content: formBody.trim(),
          pinned: formPinToTop,
          publishAt: isoPublishAt,
        });

        const newItem: OrgAnnouncementItem = {
          ...(created || {}),
          id: created?.id || `ann-org-${Date.now()}`,
          title: created?.title || formTitle.trim(),
          content: created?.content || formBody.trim(),
          status: created?.status || 'draft',
          state: created?.state || 'DRAFT',
          priority: formPriority.toLowerCase(),
          publishDate: formPublishTime,
          publishAt: created?.publishAt || isoPublishAt,
          author: created?.author || 'Organizer',
          link: formLink || undefined,
          isPinned: formPinToTop,
          pinned: formPinToTop,
          createdAt: created?.createdAt || new Date().toISOString(),
        };

        setAnnouncements((prev) => [newItem, ...prev]);
        message.success('New announcement saved as draft');
      }

      setDrawerOpen(false);
    } catch (error: any) {
      console.error('[OrgAnnouncements] Failed to save announcement:', error);
      message.error(error?.response?.data?.message || error?.message || 'Failed to save announcement');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* 1. Header Section */}
      <div className={styles.headerSection}>
        <div className={styles.headerTextGroup}>
          <span className={styles.topRoleTag}>ORGANIZER</span>
          <h1 className={styles.pageTitle}>Announcements</h1>
        </div>
        <SubmitButton
          icon={<Plus size={14} />}
          onClick={handleOpenNew}
        >
          New announcement
        </SubmitButton>
      </div>

      {/* 2. Announcements List */}
      <div className={styles.announcementsList}>
        {announcements.map((item) => {
          const isArchived = item.status === 'archived' || item.state?.toUpperCase() === 'ARCHIVED';

          return (
            <Card key={item.id} className={styles.announcementCard} variant="borderless">
              <div className={styles.cardLeftCol}>
                <div className={styles.titleRow}>
                  <span className={styles.cardTitle}>{item.title}</span>

                  {(item.status === 'draft' || item.state?.toUpperCase() === 'DRAFT') && (
                    <span className={`${styles.statusBadge} ${styles.statusDraft}`}>
                      draft
                    </span>
                  )}

                  {(item.status === 'published' || item.state?.toUpperCase() === 'PUBLISHED') && (
                    <span className={`${styles.statusBadge} ${styles.statusPublished}`}>
                      published
                    </span>
                  )}

                  {isArchived && (
                    <span className={`${styles.statusBadge} ${styles.statusArchived}`}>
                      archived
                    </span>
                  )}

                  {item.priority === 'critical' && (
                    <span className={`${styles.statusBadge} ${styles.statusCritical}`}>
                      critical
                    </span>
                  )}

                  {Boolean(item.isPinned ?? item.pinned) && (
                    <Pin size={14} className={styles.pinnedIndicator} />
                  )}
                </div>

                <p className={styles.cardDescription}>{item.content}</p>

                <div className={styles.cardMeta}>
                  <span>{item.publishDate || item.publishAt || 'Just now'}</span>
                  {item.author && (
                    <>
                      <span>·</span>
                      <span>{item.author}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Actions Right Col */}
              <div className={styles.cardActionsCol}>
                {(item.status === 'draft' || item.state?.toUpperCase() === 'DRAFT') && (
                  <button
                    type="button"
                    className={styles.publishBtn}
                    onClick={() => handlePublish(item.id)}
                  >
                    <Send size={13} />
                    <span>Publish</span>
                  </button>
                )}

                <button
                  type="button"
                  className={`${styles.actionPillBtn} ${item.isPinned ?? item.pinned ? styles.actionPillBtnActive : ''
                    }`}
                  onClick={() => handleTogglePin(item.id)}
                >
                  <Pin size={13} />
                  <span>{item.isPinned ?? item.pinned ? 'Unpin' : 'Pin'}</span>
                </button>

                <button
                  type="button"
                  className={styles.actionPillBtn}
                  onClick={() => handleEdit(item)}
                >
                  <Edit2 size={13} />
                  <span>Edit</span>
                </button>

                <button
                  type="button"
                  className={styles.actionPillBtn}
                  onClick={() => handleNotifyWhatsApp(item)}
                >
                  <MessageCircle size={13} />
                  <span>Notify WhatsApp group</span>
                </button>

                {!isArchived && (
                  <Popconfirm
                    title="Archive this announcement?"
                    description="It will be marked as archived."
                    onConfirm={() => handleArchive(item.id)}
                    okText="Archive"
                    cancelText="Cancel"
                  >
                    <button
                      type="button"
                      className={styles.actionPillBtn}
                      aria-label="Archive announcement"
                    >
                      <Archive size={13} />
                      <span>Archive</span>
                    </button>
                  </Popconfirm>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* 3. New / Edit Announcement Drawer (Screenshot 2) */}
      <Drawer
        title={editingItem ? 'Edit announcement' : 'New announcement'}
        placement="right"
        size={460}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        styles={{
          header: {
            background: isLight ? '#ffffff' : '#070b14',
            borderBottom: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255, 255, 255, 0.08)',
            color: isLight ? '#0f172a' : '#ffffff',
            padding: '18px 24px',
          },
          body: {
            background: isLight ? '#f8fafc' : '#050a12',
            padding: 24,
          },
          footer: {
            background: isLight ? '#ffffff' : '#070b14',
            borderTop: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255, 255, 255, 0.08)',
            padding: '12px 24px',
          },
          mask: {
            backgroundColor: isLight ? 'rgba(15, 23, 42, 0.4)' : 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(3px)',
          },
        }}
        footer={
          <div className={styles.drawerFooter}>
            <CancelButton onClick={() => setDrawerOpen(false)} disabled={isSubmitting}>
              Cancel
            </CancelButton>
            <SubmitButton onClick={handleSave} loading={isSubmitting}>
              Save
            </SubmitButton>
          </div>
        }
      >
        <div className={styles.drawerSubtitle}>
          New announcements are saved as drafts until published.
        </div>

        <div className={styles.drawerForm}>
          {/* Title */}
          <div className={styles.formField}>
            <label className={styles.formLabel}>Title</label>
            <Input
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="Announcement title..."
              className={styles.formInput}
            />
          </div>

          {/* Body */}
          <div className={styles.formField}>
            <label className={styles.formLabel}>Body</label>
            <TextArea
              rows={4}
              value={formBody}
              onChange={(e) => setFormBody(e.target.value)}
              placeholder="Write your announcement..."
              className={styles.formTextarea}
            />
          </div>

          {/* Priority & Publish time */}
          <div className={styles.formRowTwo}>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Priority</label>
              <Select
                value={formPriority}
                onChange={setFormPriority}
                className={styles.formSelect}
                options={[
                  { value: 'Normal', label: 'Normal' },
                  { value: 'Critical', label: 'Critical' },
                  { value: 'Important', label: 'Important' },
                  { value: 'Info', label: 'Info' },
                ]}
              />
            </div>

            <div className={styles.formField}>
              <label className={styles.formLabel}>Publish time</label>
              <Input
                value={formPublishTime}
                onChange={(e) => setFormPublishTime(e.target.value)}
                placeholder="14-10-2026 22:31"
                suffix={<Calendar size={15} style={{ color: '#64748b' }} />}
                className={styles.formInput}
              />
            </div>
          </div>

          {/* Link (optional) */}
          <div className={styles.formField}>
            <label className={styles.formLabel}>Link (optional)</label>
            <Input
              value={formLink}
              onChange={(e) => setFormLink(e.target.value)}
              placeholder="https://"
              className={styles.formInput}
            />
          </div>

          {/* Pin to top */}
          <div className={styles.switchRow}>
            <Switch
              checked={formPinToTop}
              onChange={setFormPinToTop}
            />
            <span className={styles.switchLabel}>Pin to top</span>
          </div>
        </div>
      </Drawer>
    </div>
  );
};

export default OrgAnnouncements;
