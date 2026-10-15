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
import { getOrgAnnouncements } from '../services/orgAnnouncementsApi';
import type { OrgAnnouncementItem } from '../types/orgAnnouncements.types';
import styles from './OrgAnnouncements.module.css';

const { TextArea } = Input;

export const OrgAnnouncements: React.FC = () => {
  const { message } = App.useApp();
  const { themeMode } = useTheme();
  const isLight = themeMode === 'light';

  const [announcements, setAnnouncements] = useState<OrgAnnouncementItem[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<OrgAnnouncementItem | null>(null);

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
    setFormPublishTime(item.publishDate);
    setFormLink(item.link || '');
    setFormPinToTop(!!item.isPinned);
    setDrawerOpen(true);
  };

  const handlePublish = (id: string) => {
    setAnnouncements((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'published' } : item))
    );
    message.success('Announcement published successfully');
  };

  const handleTogglePin = (id: string) => {
    setAnnouncements((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextPinned = !item.isPinned;
          message.success(nextPinned ? 'Announcement pinned to top' : 'Announcement unpinned');
          return { ...item, isPinned: nextPinned };
        }
        return item;
      })
    );
  };

  const handleNotifyWhatsApp = (item: OrgAnnouncementItem) => {
    message.success(`WhatsApp notification triggered for: "${item.title}"`);
  };

  const handleArchive = (id: string) => {
    setAnnouncements((prev) => prev.filter((item) => item.id !== id));
    message.success('Announcement moved to archive');
  };

  const handleSave = () => {
    if (!formTitle.trim()) {
      message.warning('Please enter an announcement title');
      return;
    }

    if (editingItem) {
      setAnnouncements((prev) =>
        prev.map((item) =>
          item.id === editingItem.id
            ? {
                ...item,
                title: formTitle,
                content: formBody,
                priority: formPriority.toLowerCase() as any,
                publishDate: formPublishTime,
                link: formLink || undefined,
                isPinned: formPinToTop,
              }
            : item
        )
      );
      message.success('Announcement updated successfully');
    } else {
      const newItem: OrgAnnouncementItem = {
        id: `ann-org-${Date.now()}`,
        title: formTitle,
        content: formBody,
        status: 'draft',
        priority: formPriority.toLowerCase() as any,
        publishDate: formPublishTime,
        author: 'Priya Nair (Demo)',
        link: formLink || undefined,
        isPinned: formPinToTop,
      };
      setAnnouncements((prev) => [newItem, ...prev]);
      message.success('New announcement saved as draft');
    }

    setDrawerOpen(false);
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
        {announcements.map((item) => (
          <Card key={item.id} className={styles.announcementCard} variant="borderless">
            <div className={styles.cardLeftCol}>
              <div className={styles.titleRow}>
                <span className={styles.cardTitle}>{item.title}</span>

                {item.status === 'draft' && (
                  <span className={`${styles.statusBadge} ${styles.statusDraft}`}>
                    draft
                  </span>
                )}

                {item.status === 'published' && (
                  <span className={`${styles.statusBadge} ${styles.statusPublished}`}>
                    published
                  </span>
                )}

                {item.priority === 'critical' && (
                  <span className={`${styles.statusBadge} ${styles.statusCritical}`}>
                    critical
                  </span>
                )}

                {item.isPinned && (
                  <Pin size={14} className={styles.pinnedIndicator} />
                )}
              </div>

              <p className={styles.cardDescription}>{item.content}</p>

              <div className={styles.cardMeta}>
                <span>{item.publishDate}</span>
                <span>·</span>
                <span>{item.author}</span>
              </div>
            </div>

            {/* Actions Right Col */}
            <div className={styles.cardActionsCol}>
              {item.status === 'draft' && (
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
                className={`${styles.actionPillBtn} ${
                  item.isPinned ? styles.actionPillBtnActive : ''
                }`}
                onClick={() => handleTogglePin(item.id)}
              >
                <Pin size={13} />
                <span>{item.isPinned ? 'Unpin' : 'Pin'}</span>
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

              <Popconfirm
                title="Archive this announcement?"
                description="It will no longer appear in the active announcements list."
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
            </div>
          </Card>
        ))}
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
            <CancelButton onClick={() => setDrawerOpen(false)}>
              Cancel
            </CancelButton>
            <SubmitButton onClick={handleSave}>
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
