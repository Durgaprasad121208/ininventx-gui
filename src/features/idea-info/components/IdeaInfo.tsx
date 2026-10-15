'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Card, Input, Select, Tooltip, App } from 'antd';
import {
  Heart,
  History,
  Users,
  CheckCircle2,
  RotateCcw,
  XCircle,
  Archive,
  ArrowUpRight,
  ArrowLeft,
  Paperclip,
} from 'lucide-react';
import { getIdeaDetail } from '../services/ideaInfoApi';
import { likeIdea, unlikeIdea } from '@/features/browse-ideas/services/browseIdeasApi';
import type { IdeaDetailData, StageCode } from '../types/ideaInfo.types';
import styles from './IdeaInfo.module.css';

const { TextArea } = Input;

export interface IdeaInfoProps {
  ideaId?: string;
}

export const IdeaInfo: React.FC<IdeaInfoProps> = ({ ideaId }) => {
  const { message } = App.useApp();
  const searchParams = useSearchParams();
  const effectiveId = ideaId || searchParams?.get('id') || 'manage-2';

  const [idea, setIdea] = useState<IdeaDetailData | null>(null);
  const [likes, setLikes] = useState<number>(0);
  const [hasLiked, setHasLiked] = useState<boolean>(false);
  const [category, setCategory] = useState<string>('');
  const [tagsInput, setTagsInput] = useState<string>('');
  const [internalNotes, setInternalNotes] = useState<string>('');

  useEffect(() => {
    getIdeaDetail(effectiveId).then((res) => {
      setIdea(res);
      setLikes(res.likes);
      setCategory(res.category);
      setTagsInput(res.tags ? res.tags.join(', ') : '');
      setInternalNotes(res.internalNotes || '');
    });
  }, [effectiveId]);

  const [likeLoading, setLikeLoading] = useState<boolean>(false);

  const handleToggleLike = async () => {
    if (!effectiveId || likeLoading) return;
    const isCurrentlyLiked = hasLiked;
    const nextLiked = !isCurrentlyLiked;
    const delta = nextLiked ? 1 : -1;

    setLikeLoading(true);
    // Optimistic UI update
    setHasLiked(nextLiked);
    setLikes((prev) => Math.max(0, prev + delta));

    try {
      if (nextLiked) {
        await likeIdea(effectiveId);
        message.success('Idea added to your liked collection');
      } else {
        await unlikeIdea(effectiveId);
        message.info('Idea removed from your liked collection');
      }
    } catch (err) {
      console.error(`[IdeaInfo] Failed to toggle like for idea ${effectiveId}:`, err);
      // Revert on error
      setHasLiked(isCurrentlyLiked);
      setLikes((prev) => Math.max(0, prev - delta));
    } finally {
      setLikeLoading(false);
    }
  };

  const handlePromote = () => {
    if (!idea) return;
    const stageFlow: Record<StageCode, { nextCode: StageCode; nextName: string; btnLabel: string }> = {
      S1: { nextCode: 'S2', nextName: 'Screening', btnLabel: 'Promote to Presentation' },
      S2: { nextCode: 'S3', nextName: 'Presentation', btnLabel: 'Promote to Demo' },
      S3: { nextCode: 'S4', nextName: 'Demo', btnLabel: 'Promote' },
      S4: { nextCode: 'S4', nextName: 'Demo', btnLabel: 'Promote' },
    };

    const currentStage = idea.stageCode;
    const target = stageFlow[currentStage];
    if (currentStage === 'S4') {
      message.info('Idea is already at the final Demo stage');
      return;
    }

    const newHistoryEntry = {
      id: `hist-${Date.now()}`,
      action: `Promote · ${idea.stageName} → ${target.nextName} → Approved`,
      reason: 'Stage criteria met',
      author: 'Priya Nair (Demo)',
      timestamp: 'Just now',
    };

    setIdea((prev) =>
      prev
        ? {
            ...prev,
            stageCode: target.nextCode,
            stageName: target.nextName,
            status: 'Approved',
            stageHistory: [newHistoryEntry, ...prev.stageHistory],
          }
        : null
    );

    message.success(`Idea promoted to ${target.nextName}`);
  };

  const handleApprove = () => {
    if (!idea) return;
    const newHistoryEntry = {
      id: `hist-${Date.now()}`,
      action: `Status change → Approved`,
      author: 'Priya Nair (Demo)',
      timestamp: 'Just now',
    };
    setIdea((prev) =>
      prev
        ? {
            ...prev,
            status: 'Approved',
            stageHistory: [newHistoryEntry, ...prev.stageHistory],
          }
        : null
    );
    message.success('Idea marked as Approved');
  };

  const handleRequestChanges = () => {
    if (!idea) return;
    const newHistoryEntry = {
      id: `hist-${Date.now()}`,
      action: `Feedback provided → Request changes`,
      author: 'Priya Nair (Demo)',
      timestamp: 'Just now',
    };
    setIdea((prev) =>
      prev
        ? {
            ...prev,
            status: 'Under review',
            stageHistory: [newHistoryEntry, ...prev.stageHistory],
          }
        : null
    );
    message.info('Changes requested from idea owner');
  };

  const handleReject = () => {
    if (!idea) return;
    const newHistoryEntry = {
      id: `hist-${Date.now()}`,
      action: `Decision → Rejected`,
      author: 'Priya Nair (Demo)',
      timestamp: 'Just now',
    };
    setIdea((prev) =>
      prev
        ? {
            ...prev,
            status: 'Rejected',
            stageHistory: [newHistoryEntry, ...prev.stageHistory],
          }
        : null
    );
    message.error('Idea decision recorded: Rejected');
  };

  const handleArchive = () => {
    if (!idea) return;
    const newHistoryEntry = {
      id: `hist-${Date.now()}`,
      action: `Archived`,
      author: 'Priya Nair (Demo)',
      timestamp: 'Just now',
    };
    setIdea((prev) =>
      prev
        ? {
            ...prev,
            status: 'Archived',
            stageHistory: [newHistoryEntry, ...prev.stageHistory],
          }
        : null
    );
    message.info('Idea archived');
  };

  const handleRestore = () => {
    if (!idea) return;
    const newHistoryEntry = {
      id: `hist-${Date.now()}`,
      action: `Restored to active review`,
      author: 'Priya Nair (Demo)',
      timestamp: 'Just now',
    };
    setIdea((prev) =>
      prev
        ? {
            ...prev,
            status: 'Submitted',
            stageHistory: [newHistoryEntry, ...prev.stageHistory],
          }
        : null
    );
    message.success('Idea restored to review queue');
  };

  const handleSaveMetadata = () => {
    message.success('Administrative metadata saved');
  };

  if (!idea) {
    return <div className={styles.container}>Loading idea details...</div>;
  }

  // Stages definition
  const STAGES: { code: StageCode; label: string }[] = [
    { code: 'S1', label: 'S1 Idea Submission' },
    { code: 'S2', label: 'S2 Screening' },
    { code: 'S3', label: 'S3 Presentation' },
    { code: 'S4', label: 'S4 Demo' },
  ];

  const stageOrder: Record<StageCode, number> = {
    S1: 1,
    S2: 2,
    S3: 3,
    S4: 4,
  };

  const currentLevel = stageOrder[idea.stageCode] || 1;

  const promoteBtnText =
    idea.stageCode === 'S1'
      ? 'Promote to Screening ↗'
      : idea.stageCode === 'S2'
      ? 'Promote to Presentation ↗'
      : idea.stageCode === 'S3'
      ? 'Promote to Demo ↗'
      : 'Promote ↗';

  return (
    <div className={styles.container}>
      {/* Back Link */}
      <Link href="/organizer/manage-ideas" className={styles.backLink}>
        <ArrowLeft size={14} />
        <span>Back to Manage ideas</span>
      </Link>

      {/* 1. Hero Banner Card */}
      <Card className={styles.heroBannerCard} variant="borderless">
        <div className={styles.bannerBadgesRow}>
          <span className={styles.stageBadge}>
            <span>{idea.stageCode}</span>
            <span>{idea.stageName}</span>
          </span>

          <span
            className={`${styles.statusBadge} ${
              idea.status === 'Approved' ? styles.statusApproved : ''
            }`}
          >
            {idea.status}
          </span>

          {idea.isDemoContent && (
            <span className={styles.demoContentTag}>DEMO CONTENT</span>
          )}
        </div>

        <h1 className={styles.ideaTitle}>{idea.title}</h1>
        <div className={styles.categorySubtitle}>{idea.category}</div>

        <div className={styles.bannerMetaRow}>
          <Tooltip title={hasLiked ? 'Unlike' : 'Like idea'}>
            <button
              type="button"
              className={styles.likesBtn}
              disabled={likeLoading}
              onClick={handleToggleLike}
              aria-label="Like idea"
            >
              <Heart
                size={14}
                style={{
                  color: hasLiked ? '#ef4444' : '#94a3b8',
                  fill: hasLiked ? '#ef4444' : 'none',
                }}
              />
              <span>{likes}</span>
            </button>
          </Tooltip>
          <span>·</span>
          <span>
            Created {idea.createdAt} · Updated {idea.updatedAt}
          </span>
        </div>
      </Card>

      {/* 2. Stage Progress Stepper Card */}
      <Card className={styles.stepperCard} variant="borderless">
        <div className={styles.stepperGrid}>
          {STAGES.map((s, index) => {
            const stepLevel = index + 1;
            const isCompletedOrActive = stepLevel <= currentLevel;
            const isCurrent = stepLevel === currentLevel;

            return (
              <div key={s.code} className={styles.stepSegment}>
                <div
                  className={`${styles.stepBar} ${
                    isCompletedOrActive ? styles.stepBarActive : ''
                  }`}
                />
                <span
                  className={`${styles.stepLabel} ${
                    isCurrent ? styles.stepLabelActive : ''
                  }`}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* 3. Main Two-Column Content Grid */}
      <div className={styles.mainGrid}>
        {/* Left Column (Description, Stage History, Attachments, Category) */}
        <div className={styles.leftCol}>
          {/* Description Card */}
          <Card className={styles.sectionCard} variant="borderless">
            <h2 className={styles.sectionTitle}>Description</h2>
            <p className={styles.descriptionText}>{idea.description}</p>
          </Card>

          {/* Stage History Card */}
          <Card className={styles.sectionCard} variant="borderless">
            <h2 className={styles.sectionTitle}>
              <History size={16} />
              <span>Stage history</span>
            </h2>
            <div className={styles.historyList}>
              {idea.stageHistory.map((item) => (
                <div key={item.id} className={styles.historyEntry}>
                  <span className={styles.historyAction}>{item.action}</span>
                  {item.reason && (
                    <span className={styles.historyReason}>&quot;{item.reason}&quot;</span>
                  )}
                  <span className={styles.historyMeta}>
                    {item.author} · {item.timestamp}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Attachments Card */}
          <Card className={styles.sectionCard} variant="borderless">
            <h2 className={styles.sectionTitle}>Attachments</h2>
            {idea.attachments.length === 0 ? (
              <p className={styles.attachmentsEmpty}>No attachments.</p>
            ) : (
              idea.attachments.map((file, idx) => (
                <div key={`${file}-${idx}`} className={styles.attachmentItem}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Paperclip size={13} style={{ color: '#29c9d1' }} />
                    <span>{file}</span>
                  </div>
                </div>
              ))
            )}
          </Card>

          {/* Category Pill */}
          <div className={styles.categoryBottomPill}>{idea.category}</div>
        </div>

        {/* Right Column (Organizer Review + Team/Author) */}
        <div className={styles.rightCol}>
          {/* Organizer Review Card */}
          <Card className={styles.sectionCard} variant="borderless">
            <div className={styles.organizerReviewHeader}>
              <h2 className={styles.sectionTitle}>Organizer review</h2>
              <p className={styles.organizerReviewSubtitle}>
                Every decision is recorded with reason, reviewer and timestamp.
              </p>
            </div>

            {/* Promote Primary Button */}
            <button
              type="button"
              className={styles.promotePrimaryBtn}
              onClick={handlePromote}
            >
              <ArrowUpRight size={14} />
              <span>{promoteBtnText}</span>
            </button>

            {/* 2x2 Actions Grid */}
            <div className={styles.actionsGrid}>
              <button
                type="button"
                className={styles.actionBtn}
                onClick={handleApprove}
              >
                <CheckCircle2 size={13} />
                <span>Approve</span>
              </button>

              <button
                type="button"
                className={styles.actionBtn}
                onClick={handleRequestChanges}
              >
                <RotateCcw size={13} />
                <span>Request changes</span>
              </button>

              <button
                type="button"
                className={`${styles.actionBtn} ${styles.actionBtnReject}`}
                onClick={handleReject}
              >
                <XCircle size={13} />
                <span>Reject</span>
              </button>

              <button
                type="button"
                className={styles.actionBtn}
                onClick={handleArchive}
              >
                <Archive size={13} />
                <span>Archive</span>
              </button>

              <button
                type="button"
                className={`${styles.actionBtn} ${styles.actionBtnFull}`}
                onClick={handleRestore}
              >
                <RotateCcw size={13} />
                <span>Restore</span>
              </button>
            </div>

            {/* Administrative Metadata Form */}
            <div className={styles.adminMetadataSection}>
              <span className={styles.adminMetadataTitle}>
                Administrative metadata
              </span>

              <Select
                value={category}
                onChange={setCategory}
                popupMatchSelectWidth={false}
                className={styles.adminInput}
                options={[
                  { value: 'AI & Data Analytics', label: 'AI & Data Analytics' },
                  { value: 'Customer & Business Solutions', label: 'Customer & Business Solutions' },
                  { value: 'Smart Factories', label: 'Smart Factories' },
                  { value: 'Industrial Automation', label: 'Industrial Automation' },
                  { value: 'Product & Process Innovation', label: 'Product & Process Innovation' },
                ]}
              />

              <Input
                placeholder="Tags, comma separated"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className={styles.adminInput}
              />

              <TextArea
                rows={3}
                placeholder="Internal notes (organizers only)"
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                className={styles.adminTextarea}
              />

              <button
                type="button"
                className={styles.saveMetaBtn}
                onClick={handleSaveMetadata}
              >
                Save metadata
              </button>
            </div>
          </Card>

          {/* Team / Author Card */}
          <Card className={styles.sectionCard} variant="borderless">
            <h2 className={styles.teamCardTitle}>
              <Users size={16} style={{ color: '#94a3b8' }} />
              <span>{idea.teamName}</span>
            </h2>

            <div className={styles.authorRow}>
              <span>{idea.ownerName}</span>
              <span className={styles.ownerPill}>{idea.ownerRole}</span>
            </div>

            <div className={styles.companyRow}>
              <span
                className={styles.companyDot}
                style={{ backgroundColor: idea.companyDotColor }}
              />
              <span>{idea.company}</span>
            </div>

            <div className={styles.teamFooter}>{idea.teamMembersCount}</div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default IdeaInfo;
