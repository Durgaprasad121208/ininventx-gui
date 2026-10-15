'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, Input, Switch, Drawer, App, Popconfirm, Spin } from 'antd';
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
import {
  getOrgGuidelines,
  createGuidelineWithFile,
  updateOrgGuideline,
  deleteOrgGuideline,
  toggleGuidelinePublish,
} from '../services/orgGuidelinessApi';
import type { OrgGuidelineItem, GuidelineInputDto } from '../types/orgGuideliness.types';
import styles from './OrgGuideliness.module.css';

const { TextArea } = Input;

export const OrgGuideliness: React.FC = () => {
  const { message } = App.useApp();
  const { themeMode } = useTheme();
  const isLight = themeMode === 'light';

  const [guidelines, setGuidelines] = useState<OrgGuidelineItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<OrgGuidelineItem | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formVersion, setFormVersion] = useState('1.0');
  const [formDate, setFormDate] = useState('14-10-2026');
  const [formPublished, setFormPublished] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formFile, setFormFile] = useState<{ name: string; size: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch real guidelines from API
  const loadGuidelines = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getOrgGuidelines();
      setGuidelines(data);
    } catch (err) {
      console.warn('[OrgGuideliness] Failed to load guidelines:', err);
      setGuidelines([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGuidelines();
  }, [loadGuidelines]);

  const handleOpenNew = () => {
    setEditingItem(null);
    setFormTitle('');
    setFormDescription('');
    setFormVersion('1.0');
    setFormDate(
      new Date()
        .toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
        .replace(/\//g, '-')
    );
    setFormPublished(false);
    setSelectedFile(null);
    setFormFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setDrawerOpen(true);
  };

  const handleEdit = (item: OrgGuidelineItem) => {
    setEditingItem(item);
    setFormTitle(item.title);
    setFormDescription(item.description);
    setFormVersion(item.version.replace(/[^\d.]/g, '') || '1.0');
    setFormDate(item.publishDate);
    setFormPublished(item.isPublished);
    setSelectedFile(null);
    setFormFile(item.fileName ? { name: item.fileName, size: item.fileSize || 'Attached' } : null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setDrawerOpen(true);
  };

  const handleTogglePublish = async (id: string, checked: boolean) => {
    setGuidelines((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isPublished: checked } : item))
    );
    try {
      await toggleGuidelinePublish(id, checked);
      message.success(checked ? 'Guideline published' : 'Guideline unpublished');
    } catch (err) {
      console.warn('[OrgGuideliness] Could not persist publish status to backend:', err);
      // Revert if request failed
      setGuidelines((prev) =>
        prev.map((item) => (item.id === id ? { ...item, isPublished: !checked } : item))
      );
      message.error('Failed to update published status');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteOrgGuideline(id);
      setGuidelines((prev) => prev.filter((item) => item.id !== id));
      message.success('Guideline deleted');
    } catch (err) {
      console.warn('[OrgGuideliness] Could not delete from backend:', err);
      setGuidelines((prev) => prev.filter((item) => item.id !== id));
      message.success('Guideline removed');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const sizeKb = Math.round(file.size / 1024);
      setFormFile({
        name: file.name,
        size: `${sizeKb} KB`,
      });
      message.success(`Selected file: ${file.name}`);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFormFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = async () => {
    if (!formTitle.trim()) {
      message.warning('Please enter a guideline title');
      return;
    }

    const inputData: GuidelineInputDto = {
      title: formTitle.trim(),
      description: formDescription.trim(),
      version: formVersion.startsWith('v') ? formVersion : `v${formVersion}`,
      publishDate: formDate,
      isPublished: formPublished,
    };

    setSaving(true);
    try {
      if (editingItem) {
        // Update existing
        const updated = await updateOrgGuideline(editingItem.id, inputData, selectedFile);
        if (updated?.id) {
          setGuidelines((prev) =>
            prev.map((g) => (g.id === editingItem.id ? updated : g))
          );
        } else {
          await loadGuidelines();
        }
        message.success('Guideline updated successfully');
      } else {
        // Create new guideline via POST /api/organizer/guidelines/with-file using fileUpload
        const created = await createGuidelineWithFile(inputData, selectedFile);
        if (created?.id) {
          setGuidelines((prev) => [created, ...prev]);
        } else {
          await loadGuidelines();
        }
        message.success('New guideline created successfully');
      }
      setDrawerOpen(false);
    } catch (error: any) {
      console.error('[OrgGuideliness] Failed to save guideline:', error);
      message.error(error?.message || 'Failed to save guideline. Please check the backend connection.');
    } finally {
      setSaving(false);
    }
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
      <Spin spinning={loading} size="large">
        <div className={styles.guidelinesList}>
          {!loading && guidelines.length === 0 ? (
            <Card
              className={styles.guidelineCard}
              variant="borderless"
              style={{ textAlign: 'center', padding: '40px 24px' }}
            >
              <FileText
                size={32}
                style={{ color: '#64748b', marginBottom: 12, display: 'inline-block' }}
              />
              <div style={{ color: '#94a3b8', fontSize: 14, fontWeight: 500 }}>
                No guidelines created yet
              </div>
              <p style={{ color: '#64748b', fontSize: 12, marginTop: 4 }}>
                Click &quot;New guideline&quot; to publish a participant guide or policy document.
              </p>
            </Card>
          ) : (
            guidelines.map((item) => (
              <Card key={item.id} className={styles.guidelineCard} variant="borderless">
                <div className={styles.cardLeftCol}>
                  <div className={styles.fileIconWrapper}>
                    <FileText size={24} className={styles.fileIcon} strokeWidth={1.8} />
                  </div>
                  <div className={styles.detailsCol}>
                    <div className={styles.titleRow}>
                      <span className={styles.cardTitle}>{item.title}</span>
                      <span
                        className={`${styles.statusBadge} ${item.isPublished
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
                      <span>{item.fileName ? `${item.fileName} (${item.fileSize || ''})` : 'No file'}</span>
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
            ))
          )}
        </div>
      </Spin>

      {/* 3. New / Edit Guideline Drawer */}
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
            <CancelButton onClick={() => setDrawerOpen(false)} disabled={saving}>
              Cancel
            </CancelButton>
            <SubmitButton onClick={handleSave} loading={saving}>
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
              disabled={saving}
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
              disabled={saving}
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
                disabled={saving}
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
                disabled={saving}
              />
            </div>
          </div>

          {/* Published Toggle */}
          <div className={styles.switchRow}>
            <Switch
              checked={formPublished}
              onChange={setFormPublished}
              disabled={saving}
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
              disabled={saving}
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
                  onClick={handleRemoveFile}
                  disabled={saving}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                  }}
                  aria-label="Remove attached file"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div
                className={styles.uploadDropzone}
                onClick={() => !saving && fileInputRef.current?.click()}
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
