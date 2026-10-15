'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, Input, Switch, Drawer, App, Popconfirm } from 'antd';
import {
  FileText,
  Plus,
  Edit2,
  Trash2,
  Upload as UploadIcon,
  X,
  File,
  Calendar,
} from 'lucide-react';
import { useTheme } from '@/providers/theme/ThemeProvider';
import { SubmitButton, CancelButton } from '@/components/ui/app-button/AppButton';
import { getOrgGuidelines } from '../services/orgGuidelinessApi';
import type { OrgGuidelineItem } from '../types/orgGuideliness.types';
import styles from './OrgGuideliness.module.css';

const { TextArea } = Input;

export const OrgGuideliness: React.FC = () => {
  const { message } = App.useApp();
  const { themeMode } = useTheme();
  const isLight = themeMode === 'light';
  const [guidelines, setGuidelines] = useState<OrgGuidelineItem[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<OrgGuidelineItem | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formVersion, setFormVersion] = useState('1.0');
  const [formDate, setFormDate] = useState('14-10-2026');
  const [formPublished, setFormPublished] = useState(false);
  const [formFile, setFormFile] = useState<{ name: string; size: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getOrgGuidelines().then((data) => {
      setGuidelines(data);
    });
  }, []);

  const handleOpenNew = () => {
    setEditingItem(null);
    setFormTitle('');
    setFormDescription('');
    setFormVersion('1.0');
    setFormDate('14-10-2026');
    setFormPublished(false);
    setFormFile(null);
    setDrawerOpen(true);
  };

  const handleEdit = (item: OrgGuidelineItem) => {
    setEditingItem(item);
    setFormTitle(item.title);
    setFormDescription(item.description);
    setFormVersion(item.version.replace(/[^\d.]/g, '') || '1.0');
    setFormDate(item.publishDate);
    setFormPublished(item.isPublished);
    setFormFile(item.fileName ? { name: item.fileName, size: item.fileSize || '100 KB' } : null);
    setDrawerOpen(true);
  };

  const handleTogglePublish = (id: string, checked: boolean) => {
    setGuidelines((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isPublished: checked } : item))
    );
    message.success(checked ? 'Guideline published' : 'Guideline unpublished');
  };

  const handleDelete = (id: string) => {
    setGuidelines((prev) => prev.filter((item) => item.id !== id));
    message.success('Guideline deleted');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const sizeKb = Math.round(file.size / 1024);
      setFormFile({
        name: file.name,
        size: `${sizeKb} KB`,
      });
      message.success(`Uploaded ${file.name}`);
    }
  };

  const handleSave = () => {
    if (!formTitle.trim()) {
      message.warning('Please enter a guideline title');
      return;
    }

    if (editingItem) {
      // Update existing
      setGuidelines((prev) =>
        prev.map((g) =>
          g.id === editingItem.id
            ? {
                ...g,
                title: formTitle,
                description: formDescription,
                version: `v${formVersion}`,
                publishDate: formDate,
                isPublished: formPublished,
                fileName: formFile?.name,
                fileSize: formFile?.size,
              }
            : g
        )
      );
      message.success('Guideline updated successfully');
    } else {
      // Add new
      const newItem: OrgGuidelineItem = {
        id: `guide-${Date.now()}`,
        title: formTitle,
        description: formDescription,
        version: `v${formVersion}`,
        publishDate: formDate,
        isPublished: formPublished,
        fileName: formFile?.name,
        fileSize: formFile?.size,
      };
      setGuidelines((prev) => [newItem, ...prev]);
      message.success('New guideline created');
    }

    setDrawerOpen(false);
  };

  return (
    <div className={styles.container}>
      {/* 1. Header Section */}
      <div className={styles.headerSection}>
        <div className={styles.headerTextGroup}>
          <span className={styles.topRoleTag}>ORGANIZER</span>
          <h1 className={styles.pageTitle}>Guidelines</h1>
          <p className={styles.pageSubtitle}>
            Published documents appear on the employee Guidelines page.
          </p>
        </div>
        <SubmitButton
          icon={<Plus size={14} />}
          onClick={handleOpenNew}
        >
          New guideline
        </SubmitButton>
      </div>

      {/* 2. Guidelines List */}
      <div className={styles.guidelinesList}>
        {guidelines.map((item) => (
          <Card key={item.id} className={styles.guidelineCard} variant="borderless">
            <div className={styles.cardLeftCol}>
              <div className={styles.fileIconWrapper}>
                <FileText size={24} className={styles.fileIcon} strokeWidth={1.8} />
              </div>
              <div className={styles.detailsCol}>
                <div className={styles.titleRow}>
                  <span className={styles.cardTitle}>{item.title}</span>
                  <span
                    className={`${styles.statusBadge} ${
                      item.isPublished
                        ? styles.statusPublished
                        : styles.statusUnpublished
                    }`}
                  >
                    {item.isPublished ? 'Published' : 'Unpublished'}
                  </span>
                </div>
                <p className={styles.cardDescription}>{item.description}</p>
                <div className={styles.cardMeta}>
                  <span>{item.version}</span>
                  <span>·</span>
                  <span>{item.publishDate}</span>
                  <span>·</span>
                  <span>{item.fileName ? `${item.fileName} (${item.fileSize})` : 'No file'}</span>
                </div>
              </div>
            </div>

            {/* Actions Right Col */}
            <div className={styles.cardActionsCol}>
              <Switch
                checked={item.isPublished}
                onChange={(checked) => handleTogglePublish(item.id, checked)}
              />

              <button
                type="button"
                className={styles.editBtn}
                onClick={() => handleEdit(item)}
              >
                <Edit2 size={13} />
                <span>Edit</span>
              </button>

              <Popconfirm
                title="Delete this guideline?"
                description="This action cannot be undone."
                onConfirm={() => handleDelete(item.id)}
                okText="Delete"
                cancelText="Cancel"
                okButtonProps={{ danger: true }}
              >
                <button
                  type="button"
                  className={styles.deleteBtn}
                  aria-label="Delete guideline"
                >
                  <Trash2 size={15} />
                </button>
              </Popconfirm>
            </div>
          </Card>
        ))}
      </div>

      {/* 3. New / Edit Guideline Drawer (Drawer instead of modal as instructed) */}
      <Drawer
        title={editingItem ? 'Edit guideline' : 'New guideline'}
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
        <div className={styles.drawerForm}>
          {/* Title */}
          <div className={styles.formField}>
            <label className={styles.formLabel}>Title</label>
            <Input
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="Guideline title..."
              className={styles.formInput}
            />
          </div>

          {/* Description */}
          <div className={styles.formField}>
            <label className={styles.formLabel}>Description</label>
            <TextArea
              rows={3}
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Brief description of the guideline..."
              className={styles.formTextarea}
            />
          </div>

          {/* Version & Date */}
          <div className={styles.formRowTwo}>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Version</label>
              <Input
                value={formVersion}
                onChange={(e) => setFormVersion(e.target.value)}
                placeholder="1.0"
                className={styles.formInput}
              />
            </div>

            <div className={styles.formField}>
              <label className={styles.formLabel}>Publish date</label>
              <Input
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                placeholder="14-10-2026"
                suffix={<Calendar size={15} style={{ color: '#64748b' }} />}
                className={styles.formInput}
              />
            </div>
          </div>

          {/* Published Toggle */}
          <div className={styles.switchRow}>
            <Switch
              checked={formPublished}
              onChange={setFormPublished}
            />
            <span className={styles.switchLabel}>Published</span>
          </div>

          {/* Upload File Section */}
          <div className={styles.formField}>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              style={{ display: 'none' }}
              accept=".pdf,.docx,.doc"
            />

            {formFile ? (
              <div className={styles.uploadedFilePill}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <File size={14} style={{ color: '#29c9d1' }} />
                  <span>{formFile.name}</span>
                  <span style={{ color: '#64748b' }}>({formFile.size})</span>
                </div>
                <button
                  type="button"
                  onClick={() => setFormFile(null)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                  }}
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div
                className={styles.uploadDropzone}
                onClick={() => fileInputRef.current?.click()}
              >
                <UploadIcon size={16} className={styles.uploadIcon} />
                <span>Upload PDF / DOCX</span>
              </div>
            )}
          </div>
        </div>
      </Drawer>
    </div>
  );
};

export default OrgGuideliness;
