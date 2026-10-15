'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, Row, Col, Spin } from 'antd';
import { PlusCircle, Paperclip, Inbox, Edit2 } from 'lucide-react';
import { SubmitButton } from '@/components/ui/app-button/AppButton';
import { renderIdeaThumbnail } from '@/assets/IdeaThumbnails';
import { getMyIdeas } from '../services/myIdeasApi';
import type {
  MyIdeaItem,
  MyIdeaStatus,
  BackendMyIdeaItem,
} from '../types/myIdeas.types';
import styles from './MyIdeas.module.css';

const SVG_THUMBNAILS: Array<'factory' | 'robotics' | 'handshake' | 'leaf'> = [
  'factory',
  'robotics',
  'handshake',
  'leaf',
];

/**
 * Returns a stable pseudo-random SVG thumbnail from the available SVG components
 */
const getRandomThumbnail = (
  id: string,
  index: number
): 'factory' | 'robotics' | 'handshake' | 'leaf' => {
  if (!id) return SVG_THUMBNAILS[index % SVG_THUMBNAILS.length];
  const charSum = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), index);
  return SVG_THUMBNAILS[Math.abs(charSum) % SVG_THUMBNAILS.length];
};

/**
 * Format backend category code (e.g. AR_VR, AI_DATA_ANALYTICS) to display label
 */
const formatCategory = (category?: string): string => {
  if (!category) return 'General';
  const catMap: Record<string, string> = {
    AI_DATA_ANALYTICS: 'AI & Data Analytics',
    CUSTOMER_BUSINESS: 'Customer & Business',
    PRODUCT_PROCESS: 'Product & Process',
    MODELLING_SIMULATION: 'Modelling & Simulation',
    ENERGY_SUSTAINABILITY: 'Energy & Sustainability',
    AR_VR: 'AR & VR',
    SMART_FACTORIES: 'Smart Factories',
  };
  const key = category.toUpperCase();
  if (catMap[key]) return catMap[key];
  return category.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
};

/**
 * Format backend stage code (e.g. IDEA_SUBMISSION) to display label
 */
const formatStage = (stage?: string): string => {
  if (!stage) return 'S1 Idea Submission';
  const stageMap: Record<string, string> = {
    IDEA_SUBMISSION: 'S1 Idea Submission',
    SCREENING: 'S2 Screening',
    PRESENTATION: 'S3 Presentation',
    DEMO: 'S4 Demo',
  };
  const key = stage.toUpperCase();
  if (stageMap[key]) return stageMap[key];
  return stage.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
};

/**
 * Format backend status code (e.g. DRAFT, SUBMITTED) to display label
 */
const formatStatus = (status?: string): MyIdeaStatus => {
  if (!status) return 'Draft';
  const statusMap: Record<string, MyIdeaStatus> = {
    DRAFT: 'Draft',
    SUBMITTED: 'Submitted',
    CHANGES_REQUESTED: 'Changes requested',
    APPROVED: 'Approved',
    UNDER_REVIEW: 'Under review',
  };
  const key = status.toUpperCase();
  if (statusMap[key]) return statusMap[key];
  return (status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()) as MyIdeaStatus;
};

/**
 * Format ISO date string into readable format (e.g. 15 Oct 2026)
 */
const formatDate = (isoString?: string): string => {
  if (!isoString) return 'Just now';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return isoString;
  }
};

/**
 * Map backend idea item to frontend MyIdeaItem structure
 */
const mapBackendIdeaToMyIdea = (item: BackendMyIdeaItem, index: number): MyIdeaItem => {
  const comp = item.company || 'Nexsys';
  let dotColor = '#10b981';
  if (comp.toLowerCase().includes('mantix')) dotColor = '#38bdf8';
  else if (comp.toLowerCase().includes('stability')) dotColor = '#f59e0b';

  return {
    id: item.id,
    title: item.title,
    description: item.summary || '',
    category: formatCategory(item.category),
    status: formatStatus(item.status),
    stage: formatStage(item.stage),
    stageBadge: 'DEMO',
    author: item.ownerName || 'You',
    company: comp,
    team: item.team || 'OneTeam',
    teamDotColor: dotColor,
    date: formatDate(item.createdAt),
    attachments: item.attachments,
    likes: item.likeCount ?? 0,
    thumbnailType: getRandomThumbnail(item.id, index),
  };
};

export const MyIdeas: React.FC = () => {
  const router = useRouter();
  const [ideas, setIdeas] = useState<MyIdeaItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const maxAllowance = 5;

  const fetchIdeas = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMyIdeas();
      const mapped = data.map(mapBackendIdeaToMyIdea);
      setIdeas(mapped);
    } catch (err) {
      console.error('[MyIdeas] Error fetching ideas:', err);
      setIdeas([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIdeas();
  }, [fetchIdeas]);

  const getStatusClass = (status: MyIdeaStatus | string) => {
    const s = String(status).toUpperCase();
    if (s.includes('UNDER_REVIEW') || s === 'UNDER REVIEW') {
      return styles.statusTagUnderReview;
    }
    if (s === 'DRAFT') {
      return styles.statusTagDraft;
    }
    if (s === 'SUBMITTED') {
      return styles.statusTagSubmitted;
    }
    if (s === 'APPROVED') {
      return styles.statusTagApproved;
    }
    if (s.includes('CHANGE')) {
      return styles.statusTagChangesRequested;
    }
    return styles.statusTagDraft;
  };

  const allowancePercent = Math.min(Math.round((ideas.length / maxAllowance) * 100), 100);

  return (
    <div className={styles.container}>
      {/* 1. Header Section */}
      <div className={styles.headerSection}>
        <div className={styles.headerLeft}>
          <h1 className={styles.pageTitle}>My ideas</h1>
          <p className={styles.pageSubtitle}>
            Only you can edit your ideas. Drafts are private until submitted.
          </p>
        </div>

        <Link href="/submit-idea" style={{ textDecoration: 'none' }}>
          <SubmitButton icon={<PlusCircle size={15} strokeWidth={2.2} />}>
            New idea
          </SubmitButton>
        </Link>
      </div>

      {/* 2. Idea Allowance Section */}
      <div className={styles.allowanceContainer}>
        <div className={styles.allowanceLabels}>
          <span className={styles.allowanceTitle}>Idea allowance</span>
          <span className={styles.allowanceCount}>
            {ideas.length}/{maxAllowance}
          </span>
        </div>
        <div className={styles.progressBarTrack}>
          <div
            className={styles.progressBarFill}
            style={{ width: `${allowancePercent}%` }}
          />
        </div>
      </div>

      {/* 3. Ideas Grid or Empty State with Spin Loader */}
      <Spin spinning={loading} size="large" classNames={{ root: styles.spinWrapper }}>
        <div className={styles.gridContainer}>
          {!loading && ideas.length === 0 ? (
            /* Empty State Display (Screenshot 2) */
            <div className={styles.emptyCard}>
              <div className={styles.emptyIconCircle}>
                <Inbox size={22} strokeWidth={1.8} />
              </div>
              <h2 className={styles.emptyTitle}>You haven&apos;t created any ideas yet</h2>
              <p className={styles.emptySubtitle}>
                Start with a draft — you can refine it before submitting.
              </p>
              <Link href="/submit-idea" style={{ textDecoration: 'none' }}>
                <SubmitButton>Create an idea</SubmitButton>
              </Link>
            </div>
          ) : (
            /* Active Ideas Grid (Screenshot 1) */
            <Row gutter={[16, 16]}>
              {ideas.map((idea) => (
                <Col key={idea.id} xs={24} sm={12} lg={8} xl={8}>
                  <Link href={`/my-ideas/${idea.id}`} className={styles.cardLink}>
                    <Card hoverable className={styles.ideaCard} variant="borderless">
                      {/* Thumbnail banner with badges */}
                      <div className={styles.thumbnailWrapper}>
                        {renderIdeaThumbnail(idea.thumbnailType)}

                        <div className={styles.badgesOverlay}>
                          <span className={styles.stageBadge}>{idea.stage}</span>
                          {idea.stageBadge && (
                            <span className={styles.demoBadge}>{idea.stageBadge}</span>
                          )}
                        </div>
                      </div>

                      {/* Card Content Body */}
                      <div className={styles.cardContent}>
                        {/* Tags row */}
                        <div className={styles.tagsRow}>
                          <span className={styles.categoryTag}>{idea.category}</span>
                          <span className={getStatusClass(idea.status)}>{idea.status}</span>
                        </div>

                        {/* Title & Description */}
                        <h3 className={styles.cardTitle}>{idea.title}</h3>
                        <p className={styles.cardDescription}>{idea.description}</p>

                        {/* Author & Team Section */}
                        <div className={styles.authorSection}>
                          <span className={styles.authorName}>{idea.author}</span>
                          <div className={styles.teamRow}>
                            <span
                              className={styles.statusDot}
                              style={{ backgroundColor: idea.teamDotColor }}
                            />
                            <span>{idea.company}</span>
                            <span>· {idea.team}</span>
                          </div>
                        </div>

                        {/* Card Footer: Date & Attachments & Edit Action */}
                        <div className={styles.cardFooter}>
                          <span>{idea.date}</span>

                          <div className={styles.footerActionsRight}>
                            {idea.attachments ? (
                              <span className={styles.attachmentBadge}>
                                <Paperclip size={12} />
                                <span>{idea.attachments}</span>
                              </span>
                            ) : null}

                            <button
                              type="button"
                              className={styles.cardEditBtn}
                              title="Edit idea"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                router.push(`/submit-idea?edit=${idea.id}`);
                              }}
                            >
                              <Edit2 size={11} />
                              <span>Edit</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                </Col>
              ))}
            </Row>
          )}
        </div>
      </Spin>
    </div>
  );
};

export default MyIdeas;

