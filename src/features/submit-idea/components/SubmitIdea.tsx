'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, Row, Col, Input, App } from 'antd';
import { useRouter } from 'next/navigation';
import {
  Image as ImageIcon,
  Plus,
  Paperclip,
  X,
  Trash2,
} from 'lucide-react';
import { SubmitButton, DarkButton } from '@/components/ui/app-button/AppButton';
import {
  PRIMARY_CATEGORIES,
  saveIdeaDraft,
  getIdeaDraft,
  submitIdea,
} from '../services/submitIdeaApi';
import type { AttachmentFile } from '../types/submitIdea.types';
import styles from './SubmitIdea.module.css';

const { TextArea } = Input;

export const SubmitIdea: React.FC = () => {
  const { message } = App.useApp();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [problemStatement, setProblemStatement] = useState('');
  const [expectedValue, setExpectedValue] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [posterUrl, setPosterUrl] = useState<string | null>(null);
  const [posterName, setPosterName] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<AttachmentFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const posterInputRef = useRef<HTMLInputElement>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);

  // Load existing draft if present
  useEffect(() => {
    getIdeaDraft().then((draft) => {
      if (draft) {
        if (draft.title) setTitle(draft.title);
        if (draft.description) setDescription(draft.description);
        if (draft.problemStatement) setProblemStatement(draft.problemStatement);
        if (draft.expectedBusinessValue) setExpectedValue(draft.expectedBusinessValue);
        if (draft.primaryCategory) setSelectedCategory(draft.primaryCategory);
        if (draft.posterUrl) {
          setPosterUrl(draft.posterUrl);
          setPosterName(draft.posterName || 'poster.png');
        }
        if (draft.attachments) setAttachments(draft.attachments);
      }
    });
  }, []);

  // Handle Poster Image Upload
  const handlePosterSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        message.error('Poster image must be smaller than 20 MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setPosterUrl(event.target?.result as string);
        setPosterName(file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePoster = () => {
    setPosterUrl(null);
    setPosterName(null);
    if (posterInputRef.current) {
      posterInputRef.current.value = '';
    }
  };

  // Handle Attachments Selection
  const handleAttachmentSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newAttachments: AttachmentFile[] = Array.from(files).map((f) => ({
        id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        name: f.name,
        size: f.size,
        type: f.type,
      }));
      setAttachments((prev) => [...prev, ...newAttachments]);
      message.success(`Added ${newAttachments.length} file(s)`);
    }
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Save as Draft
  const handleSaveDraft = async () => {
    const draft = {
      title,
      description,
      problemStatement,
      expectedBusinessValue: expectedValue,
      primaryCategory: selectedCategory,
      posterName: posterName || undefined,
      posterUrl: posterUrl || undefined,
      attachments,
      status: 'Draft' as const,
      createdAt: new Date().toISOString(),
    };

    const success = await saveIdeaDraft(draft);
    if (success) {
      message.info('Draft saved. You can return and complete it anytime.');
    } else {
      message.error('Failed to save draft.');
    }
  };

  // Submit Idea
  const handleSubmit = async () => {
    if (!title.trim()) {
      message.warning('Please enter a title for your idea');
      return;
    }
    if (!description.trim()) {
      message.warning('Please provide a description');
      return;
    }
    if (!selectedCategory) {
      message.warning('Please select a primary category');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await submitIdea({
        title: title.trim(),
        description: description.trim(),
        problemStatement: problemStatement.trim() || undefined,
        expectedBusinessValue: expectedValue.trim() || undefined,
        primaryCategory: selectedCategory,
        posterName: posterName || undefined,
        posterUrl: posterUrl || undefined,
        attachments,
        status: 'Submitted',
        createdAt: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
      });

      if (result.success) {
        message.success('Idea submitted successfully!');
        setTimeout(() => {
          router.push('/browse-ideas');
        }, 800);
      }
    } catch {
      message.error('Failed to submit idea. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.submitContainer}>
      {/* 1. Header Section */}
      <div className={styles.headerSection}>
        <h1 className={styles.pageTitle}>Submit an idea</h1>
        <p className={styles.pageSubtitle}>
          Combine capabilities across the group. Save a draft anytime — only submitted ideas enter screening.
        </p>
      </div>

      {/* Main 2-Column Responsive Grid */}
      <Row gutter={[20, 20]} align="top">
        {/* Left Column: Form Details & Category */}
        <Col xs={24} lg={16} xl={16}>
          <div className={styles.leftColWrapper}>
            {/* Card 1: The Idea */}
            <Card className={styles.formCard} variant="borderless">
              <h2 className={styles.cardTitle}>The idea</h2>

              {/* Title Field */}
              <div className={styles.fieldGroup}>
                <label htmlFor="idea-title" className={styles.fieldLabel}>
                  Title <span className={styles.requiredStar}>*</span>
                </label>
                <Input
                  id="idea-title"
                  placeholder="e.g. Predictive maintenance for packaging lines"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={styles.textInput}
                />
              </div>

              {/* Description Field */}
              <div className={styles.fieldGroup}>
                <label htmlFor="idea-description" className={styles.fieldLabel}>
                  Description <span className={styles.requiredStar}>*</span>
                </label>
                <div className={styles.textAreaWrapper}>
                  <TextArea
                    id="idea-description"
                    placeholder="What is it, who benefits, and how would it work?"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className={styles.textAreaInput}
                  />
                  <div className={styles.charCounter}>{description.length} chars</div>
                </div>
              </div>

              {/* Problem Statement & Expected Business Value */}
              <Row gutter={[14, 14]} style={{ marginTop: 4, marginBottom: 0 }}>
                <Col xs={24} sm={12}>
                  <div className={styles.lastFieldGroup}>
                    <label htmlFor="idea-problem" className={styles.fieldLabel}>
                      Problem statement <span className={styles.optionalTag}>(optional)</span>
                    </label>
                    <TextArea
                      id="idea-problem"
                      value={problemStatement}
                      onChange={(e) => setProblemStatement(e.target.value)}
                      rows={3}
                      className={styles.textAreaInput}
                    />
                  </div>
                </Col>

                <Col xs={24} sm={12}>
                  <div className={styles.lastFieldGroup}>
                    <label htmlFor="idea-value" className={styles.fieldLabel}>
                      Expected business value <span className={styles.optionalTag}>(optional)</span>
                    </label>
                    <TextArea
                      id="idea-value"
                      value={expectedValue}
                      onChange={(e) => setExpectedValue(e.target.value)}
                      rows={3}
                      className={styles.textAreaInput}
                    />
                  </div>
                </Col>
              </Row>
            </Card>

            {/* Card 2: Primary Category */}
            <Card className={styles.formCard} variant="borderless">
              <h2 className={styles.cardTitle}>
                Primary category <span className={styles.requiredStar}>*</span>
              </h2>
              <p className={styles.cardSubtitle}>
                Categories are outcome-based and open to everyone across all three companies.
              </p>

              <Row gutter={[10, 10]}>
                {PRIMARY_CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory === cat.title;

                  return (
                    <Col key={cat.id} xs={24} sm={12}>
                      <div
                        className={`${styles.categoryCard} ${
                          isSelected ? styles.categoryCardSelected : ''
                        }`}
                        onClick={() => setSelectedCategory(cat.title)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            setSelectedCategory(cat.title);
                          }
                        }}
                      >
                        <div className={styles.radioIndicator}>
                          {isSelected && <div className={styles.radioDot} />}
                        </div>

                        <div className={styles.categoryContent}>
                          <div className={styles.categoryTitle}>{cat.title}</div>
                          <div className={styles.categoryDescription}>{cat.description}</div>
                        </div>
                      </div>
                    </Col>
                  );
                })}
              </Row>
            </Card>
          </div>
        </Col>

        {/* Right Column: Poster, Attachments & Action Buttons */}
        <Col xs={24} lg={8} xl={8}>
          <div className={styles.rightColWrapper}>
            {/* Card 1: Poster Upload */}
            <Card className={styles.formCard} variant="borderless">
              <h2 className={styles.cardTitle}>Poster</h2>
              <p className={styles.cardSubtitle}>PNG/JPG/WEBP, up to 20 MB.</p>

              <input
                type="file"
                ref={posterInputRef}
                accept="image/png,image/jpeg,image/webp"
                style={{ display: 'none' }}
                onChange={handlePosterSelect}
              />

              {posterUrl ? (
                <div className={styles.posterPreviewWrapper}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={posterUrl} alt="Poster preview" className={styles.posterPreviewImg} />
                  <button
                    type="button"
                    onClick={handleRemovePoster}
                    className={styles.removePosterBtn}
                    title="Remove poster"
                  >
                    <Trash2 size={12} />
                    <span>Remove</span>
                  </button>
                </div>
              ) : (
                <div
                  className={styles.uploadDropzone}
                  onClick={() => posterInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                >
                  <ImageIcon size={24} className={styles.uploadIcon} />
                  <span className={styles.uploadText}>Choose poster image</span>
                </div>
              )}
            </Card>

            {/* Card 2: Attachments */}
            <Card className={styles.formCard} variant="borderless">
              <h2 className={styles.cardTitle}>Attachments</h2>
              <p className={styles.cardSubtitle}>.pdf .docx .pptx .xlsx .png .jpg .jpeg .zip</p>

              <input
                type="file"
                ref={attachmentInputRef}
                multiple
                accept=".pdf,.docx,.pptx,.xlsx,.png,.jpg,.jpeg,.zip"
                style={{ display: 'none' }}
                onChange={handleAttachmentSelect}
              />

              <button
                type="button"
                className={styles.addFilesBtn}
                onClick={() => attachmentInputRef.current?.click()}
              >
                <Plus size={14} />
                <span>Add files</span>
              </button>

              {attachments.length > 0 && (
                <div className={styles.attachmentList}>
                  {attachments.map((att) => (
                    <div key={att.id} className={styles.attachmentItem}>
                      <div className={styles.attachmentInfo} title={att.name}>
                        <Paperclip size={12} style={{ flexShrink: 0 }} />
                        <span>{att.name}</span>
                        <span style={{ color: '#64748b', fontSize: '9.5px' }}>
                          ({formatFileSize(att.size)})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachment(att.id)}
                        className={styles.attachmentRemoveBtn}
                        title="Remove file"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <p className={styles.helperNote}>
                Demo mode stores file names only — files are not uploaded.
              </p>
            </Card>

            {/* Card 3: Action Buttons */}
            <Card className={styles.actionCard} variant="borderless">
              <SubmitButton
                onClick={handleSubmit}
                loading={isSubmitting}
                className={styles.fullWidthBtn}
              >
                Submit idea
              </SubmitButton>

              <DarkButton onClick={handleSaveDraft} className={styles.fullWidthBtn}>
                Save as draft
              </DarkButton>

              <p className={styles.actionDisclaimer}>
                Drafts are only visible to you. Submitted ideas are visible to all participants.
              </p>
            </Card>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default SubmitIdea;
