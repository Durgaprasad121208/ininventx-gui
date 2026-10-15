'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams, useParams, useRouter } from 'next/navigation';
import { Card, Tooltip, App, Spin } from 'antd';
import {
  Heart,
  History,
  Users,
  ArrowLeft,
  Edit2,
  FileText,
  Download,
} from 'lucide-react';
import { getMyIdeaDetail, getMyIdeas } from '../services/myIdeasApi';
import { getIdeaDraft } from '@/features/submit-idea/services/submitIdeaApi';
import { likeIdea, unlikeIdea } from '@/features/browse-ideas/services/browseIdeasApi';
import styles from './MyIdeaInfo.module.css';

export interface MyIdeaInfoProps {
  ideaId?: string;
}

export interface NormalizedTeamMember {
  name: string;
  email?: string;
  company: string;
  roleInTeam: string;
  isOwner?: boolean;
}

export interface NormalizedTimelineEntry {
  id: string;
  action: string;
  statusBadge?: string;
  reason?: string;
  author: string;
  timestamp: string;
}

export interface NormalizedAttachment {
  id: string;
  name: string;
  size: string;
  url?: string;
}

export interface NormalizedIdeaDetail {
  id: string;
  title: string;
  category: string;
  rawCategory: string;
  description: string;
  problemStatement?: string;
  expectedBusinessValue?: string;
  stageCode: 'S1' | 'S2' | 'S3' | 'S4';
  stageName: string;
  status: string;
  isDemoContent: boolean;
  likes: number;
  hasLiked: boolean;
  createdAt: string;
  updatedAt: string;
  teamName: string;
  teamMembers: NormalizedTeamMember[];
  teamSummary: string;
  stageHistory: NormalizedTimelineEntry[];
  attachments: NormalizedAttachment[];
}

const formatCategory = (category?: string): string => {
  if (!category) return 'General';
  const catMap: Record<string, string> = {
    AI_DATA_ANALYTICS: 'Artificial Intelligence & Data Analytics',
    DIGITAL_MANUFACTURING: 'Digital Manufacturing & Smart Factories',
    CUSTOMER_BUSINESS: 'Customer & Business Solutions',
    CUSTOMER_BUSINESS_SOLUTIONS: 'Customer & Business Solutions',
    PRODUCT_PROCESS: 'Product & Process Innovation',
    PRODUCT_PROCESS_INNOVATION: 'Product & Process Innovation',
    MODELLING_SIMULATION: 'Modelling & Simulation',
    ENERGY_SUSTAINABILITY: 'Energy Efficiency & Sustainability',
    AR_VR: 'Augmented & Virtual Reality (AR/VR)',
    INDUSTRIAL_AUTOMATION: 'Industrial Automation & Control',
    ROBOTICS: 'Robotics & Intelligent Systems',
    QUALITY_RELIABILITY: 'Quality & Reliability',
    SAFETY_ERGONOMICS: 'Safety & Ergonomics',
    SMART_FACTORIES: 'Smart Factories',
  };
  const key = category.toUpperCase().replace(/[^A-Z0-9]+/g, '_');
  if (catMap[key]) return catMap[key];
  return category.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
};

const formatStageInfo = (stage?: string): { code: 'S1' | 'S2' | 'S3' | 'S4'; name: string } => {
  const upper = String(stage || '').toUpperCase();
  if (upper.includes('S4') || upper.includes('DEMO')) {
    return { code: 'S4', name: 'Demo' };
  }
  if (upper.includes('S3') || upper.includes('PRESENTATION')) {
    return { code: 'S3', name: 'Presentation' };
  }
  if (upper.includes('S2') || upper.includes('SCREENING')) {
    return { code: 'S2', name: 'Screening' };
  }
  return { code: 'S1', name: 'Idea Submission' };
};

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

const STAGES = [
  { code: 'S1', label: 'S1 Idea Submission' },
  { code: 'S2', label: 'S2 Screening' },
  { code: 'S3', label: 'S3 Presentation' },
  { code: 'S4', label: 'S4 Demo' },
];

const stageOrder: Record<string, number> = {
  S1: 1,
  S2: 2,
  S3: 3,
  S4: 4,
};

export const MyIdeaInfo: React.FC<MyIdeaInfoProps> = ({ ideaId }) => {
  const { message } = App.useApp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const routeParams = useParams();

  const effectiveId =
    ideaId ||
    (routeParams?.id as string) ||
    searchParams?.get('id') ||
    '';

  const [idea, setIdea] = useState<NormalizedIdeaDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [likes, setLikes] = useState<number>(0);
  const [hasLiked, setHasLiked] = useState<boolean>(false);
  const [likeLoading, setLikeLoading] = useState<boolean>(false);

  // Fetch idea details dynamically without hardcoding
  const loadIdea = useCallback(async () => {
    if (!effectiveId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      let raw: any = null;

      // 1. If looking for a draft saved locally
      if (effectiveId === 'draft') {
        const draft = await getIdeaDraft();
        if (draft) {
          raw = {
            ...draft,
            id: 'draft',
            stage: 'IDEA_SUBMISSION',
            status: 'Draft',
          };
        }
      }

      // 2. Try fetching from live backend GET /api/ideas/{id}
      if (!raw) {
        try {
          raw = await getMyIdeaDetail(effectiveId);
        } catch {
          // 3. Fallback: Check if item is in user's ideas list
          const mine = await getMyIdeas();
          raw = mine.find((m) => String(m.id) === String(effectiveId)) || null;
        }
      }

      if (!raw) {
        setIdea(null);
        return;
      }

      const stageInfo = formatStageInfo(raw.stage);
      const categoryLabel = formatCategory(raw.category || raw.primaryCategory);

      // Normalize team members dynamically
      let members: NormalizedTeamMember[] = [];
      if (Array.isArray(raw.teamMembers) && raw.teamMembers.length > 0) {
        members = raw.teamMembers.map((m: any, idx: number) => ({
          name: m.name || m.userName || `Member ${idx + 1}`,
          email: m.email || '',
          company: m.company || m.department || raw.company || raw.department || '',
          roleInTeam: m.roleInTeam || (idx === 0 ? 'Owner' : 'Contributor'),
          isOwner: idx === 0 || m.roleInTeam?.toLowerCase() === 'owner',
        }));
      } else {
        const ownerName = raw.ownerName || raw.author || raw.createdBy || raw.user?.name || 'Idea Submitter';
        const companyName = raw.company || raw.department || raw.user?.company || '';
        members = [
          {
            name: ownerName,
            company: companyName,
            roleInTeam: 'Owner',
            isOwner: true,
          },
        ];
      }

      // Team summary string
      const uniqueCompanies = Array.from(new Set(members.map((m) => m.company).filter(Boolean)));
      const companyPart = uniqueCompanies.length > 0 ? ` · ${uniqueCompanies.length > 1 ? 'Cross-company: ' : ''}${uniqueCompanies.join(', ')}` : '';
      const teamSummary = `${members.length} member${members.length === 1 ? '' : 's'}${companyPart}`;

      // Normalize stage history dynamically
      let history: NormalizedTimelineEntry[] = [];
      if (Array.isArray(raw.stageHistory) && raw.stageHistory.length > 0) {
        history = raw.stageHistory.map((h: any, idx: number) => ({
          id: h.id || `hist-${idx}`,
          action: h.action || 'Stage update',
          statusBadge: h.statusBadge || h.status,
          reason: h.reason || h.feedback || h.comment,
          author: h.author || h.userName || 'Reviewer',
          timestamp: h.timestamp ? formatDate(h.timestamp) : formatDate(raw.createdAt),
        }));
      } else {
        const submitterName = raw.ownerName || raw.author || raw.createdBy || raw.user?.name || 'Idea Submitter';
        const reviewerName = raw.reviewedBy || raw.reviewer || 'Review Committee';
        const createdDate = formatDate(raw.createdAt);
        const updatedDate = formatDate(raw.updatedAt || raw.createdAt);

        if (stageInfo.code !== 'S1' || raw.status === 'Under review' || raw.status === 'Approved') {
          history.push({
            id: 'hist-1',
            action: `Promote · Idea Submission → ${stageInfo.name}`,
            statusBadge: raw.status || 'Under review',
            reason: raw.reviewNote || raw.reason || (raw.status === 'Approved' ? 'Meets submission criteria.' : undefined),
            author: reviewerName,
            timestamp: updatedDate,
          });
        }
        history.push({
          id: 'hist-2',
          action: 'Submitted → Idea Submission',
          statusBadge: 'Submitted',
          author: submitterName,
          timestamp: createdDate,
        });
      }

      // Normalize attachments dynamically
      let attachments: NormalizedAttachment[] = [];
      const rawAttList = raw.attachments || raw.attachmentFiles || raw.files;
      if (Array.isArray(rawAttList) && rawAttList.length > 0) {
        attachments = rawAttList.map((att: any, idx: number) => {
          if (typeof att === 'string') {
            return {
              id: `att-${idx}`,
              name: att,
              size: 'Document',
            };
          }
          return {
            id: att.id || `att-${idx}`,
            name: att.name || att.originalFilename || att.fileName || `document-${idx + 1}.pdf`,
            size: att.size ? `${Math.max(1, Math.round(att.size / 1024))} KB` : 'Document',
            url: att.url || att.downloadUrl || att.fileUrl,
          };
        });
      } else if (raw.posterName || raw.posterUrl || raw.poster) {
        attachments.push({
          id: 'poster-1',
          name: raw.posterName || 'poster.pdf',
          size: raw.posterSize ? `${Math.round(raw.posterSize / 1024)} KB` : 'Poster Document',
          url: raw.posterUrl || raw.poster,
        });
      }

      const initialLikes = raw.likeCount ?? raw.likes ?? 0;
      const initialHasLiked = Boolean(raw.likedByMe ?? raw.hasLiked);

      setLikes(initialLikes);
      setHasLiked(initialHasLiked);

      setIdea({
        id: String(raw.id),
        title: raw.title || 'Untitled Idea',
        category: categoryLabel,
        rawCategory: raw.category || '',
        description: raw.description || raw.summary || '',
        problemStatement: raw.problemStatement || raw.targetCustomer || '',
        expectedBusinessValue: raw.expectedBusinessValue || raw.businessImpact || '',
        stageCode: stageInfo.code,
        stageName: stageInfo.name,
        status: raw.status || 'Under review',
        isDemoContent: Boolean(raw.isDemoContent || raw.stageBadge?.includes('DEMO')),
        likes: initialLikes,
        hasLiked: initialHasLiked,
        createdAt: formatDate(raw.createdAt),
        updatedAt: formatDate(raw.updatedAt || raw.createdAt),
        teamName: raw.teamName || raw.team || (raw.title ? `${raw.title} Team` : 'Idea Team'),
        teamMembers: members,
        teamSummary,
        stageHistory: history,
        attachments,
      });
    } catch (err) {
      console.error('[MyIdeaInfo] Error loading idea:', err);
      setIdea(null);
    } finally {
      setLoading(false);
    }
  }, [effectiveId]);

  useEffect(() => {
    loadIdea();
  }, [loadIdea]);

  // Handle Like Toggle
  const handleToggleLike = async () => {
    if (!effectiveId || likeLoading) return;
    const isCurrentlyLiked = hasLiked;
    const nextLiked = !isCurrentlyLiked;
    const delta = nextLiked ? 1 : -1;

    setLikeLoading(true);
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
      console.error('[MyIdeaInfo] Failed to toggle like:', err);
      // Revert optimistic state
      setHasLiked(isCurrentlyLiked);
      setLikes((prev) => Math.max(0, prev - delta));
    } finally {
      setLikeLoading(false);
    }
  };

  const handleDownloadAttachment = (att: NormalizedAttachment) => {
    if (att.url) {
      window.open(att.url, '_blank');
    } else {
      message.success(`Downloading attachment: ${att.name}`);
    }
  };

  const getCompanyDotColor = (company?: string): string => {
    const c = (company || '').toLowerCase();
    if (c.includes('nexsys')) return '#10b981';
    if (c.includes('stability')) return '#f59e0b';
    return '#38bdf8';
  };

  const getStatusStyleClass = (status?: string): string => {
    const s = (status || '').toLowerCase();
    if (s.includes('approved')) return styles.statusApproved;
    if (s.includes('review')) return styles.statusUnderReview;
    if (s.includes('change')) return styles.statusChangesRequested;
    if (s.includes('draft')) return styles.statusDraft;
    return styles.statusUnderReview;
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Spin size="large" />
        <span style={{ color: '#94a3b8', fontSize: 13 }}>Loading idea details...</span>
      </div>
    );
  }

  if (!idea) {
    return (
      <div className={styles.emptyContainer}>
        <p style={{ color: '#cbd5e1', fontSize: 16, fontWeight: 600 }}>Idea details not found</p>
        <Link href="/my-ideas" className={styles.editIdeaBtn}>
          <ArrowLeft size={14} />
          <span>Return to My ideas</span>
        </Link>
      </div>
    );
  }

  const currentLevel = stageOrder[idea.stageCode] || 1;

  return (
    <div className={styles.container}>
      {/* Back Link */}
      <Link href="/my-ideas" className={styles.backLink}>
        <ArrowLeft size={14} />
        <span>Back to My ideas</span>
      </Link>

      {/* 1. Hero Banner Card */}
      <Card className={styles.heroBannerCard} variant="borderless">
        {/* Badges Row */}
        <div className={styles.bannerBadgesRow}>
          <span className={styles.stageBadge}>
            <span>{idea.stageCode}</span>
            <span>{idea.stageName}</span>
          </span>

          <span className={`${styles.statusBadge} ${getStatusStyleClass(idea.status)}`}>
            {idea.status}
          </span>

          {idea.isDemoContent && (
            <span className={styles.demoContentTag}>DEMO CONTENT</span>
          )}
        </div>

        {/* Title & Category Subtitle */}
        <h1 className={styles.ideaTitle}>{idea.title}</h1>
        <div className={styles.categorySubtitle}>{idea.category}</div>

        {/* Banner Meta Row */}
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

          <Link
            href={`/submit-idea?edit=${idea.id}`}
            className={styles.editIdeaBtn}
          >
            <Edit2 size={13} />
            <span>Edit idea</span>
          </Link>

          <span className={styles.metaDates}>
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
        {/* Left Column (Description & Stage History) */}
        <div className={styles.leftCol}>
          {/* Description Card */}
          <Card className={styles.sectionCard} variant="borderless">
            <h2 className={styles.sectionTitle}>Description</h2>
            <p className={styles.descriptionText}>{idea.description}</p>

            {idea.problemStatement && (
              <>
                <div className={styles.subSectionHeader}>PROBLEM STATEMENT</div>
                <p className={styles.subSectionText}>{idea.problemStatement}</p>
              </>
            )}

            {idea.expectedBusinessValue && (
              <>
                <div className={styles.subSectionHeader}>EXPECTED BUSINESS VALUE</div>
                <p className={styles.subSectionText}>{idea.expectedBusinessValue}</p>
              </>
            )}
          </Card>

          {/* Stage History Card */}
          <Card className={styles.sectionCard} variant="borderless">
            <h2 className={styles.sectionTitle}>
              <History size={16} />
              <span>Stage history</span>
            </h2>

            <div className={styles.historyTimeline}>
              {idea.stageHistory.map((entry) => (
                <div key={entry.id} className={styles.timelineEntry}>
                  <div className={styles.timelineVerticalBar} />
                  <div className={styles.timelineActionRow}>
                    <span>{entry.action}</span>
                    {entry.statusBadge && (
                      <span className={`${styles.statusBadge} ${getStatusStyleClass(entry.statusBadge)}`}>
                        {entry.statusBadge}
                      </span>
                    )}
                  </div>
                  {entry.reason && (
                    <div className={styles.timelineReason}>&ldquo;{entry.reason}&rdquo;</div>
                  )}
                  <div className={styles.timelineMeta}>
                    {entry.author} · {entry.timestamp}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column (Team, Attachments & Category Pill) */}
        <div className={styles.rightCol}>
          {/* Team Members Card */}
          <Card className={styles.sectionCard} variant="borderless">
            <h2 className={styles.teamCardTitle}>
              <Users size={16} />
              <span>{idea.teamName}</span>
            </h2>

            <div className={styles.membersList}>
              {idea.teamMembers.map((member, idx) => (
                <div key={`${member.name}-${idx}`} className={styles.memberItem}>
                  <div className={styles.memberNameRow}>
                    <span className={styles.memberName}>{member.name}</span>
                    {member.isOwner && <span className={styles.ownerBadge}>Owner</span>}
                  </div>

                  {member.company && (
                    <div className={styles.memberMetaRow}>
                      <span
                        className={styles.companyDot}
                        style={{ backgroundColor: getCompanyDotColor(member.company) }}
                      />
                      <span>{member.company}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className={styles.teamSummaryFooter}>{idea.teamSummary}</div>
          </Card>

          {/* Attachments Card */}
          <Card className={styles.sectionCard} variant="borderless">
            <h2 className={styles.sectionTitle}>Attachments</h2>

            {idea.attachments.length === 0 ? (
              <p className={styles.noAttachments}>No attachments uploaded.</p>
            ) : (
              <div className={styles.attachmentsList}>
                {idea.attachments.map((att) => (
                  <div key={att.id} className={styles.attachmentItem}>
                    <div className={styles.attachmentLeft}>
                      <div className={styles.attachmentIconBox}>
                        <FileText size={16} />
                      </div>
                      <div className={styles.attachmentInfo}>
                        <span className={styles.attachmentName}>{att.name}</span>
                        <span className={styles.attachmentSize}>{att.size}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className={styles.downloadBtn}
                      onClick={() => handleDownloadAttachment(att)}
                      aria-label={`Download ${att.name}`}
                    >
                      <Download size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Category Pill Tag below attachments */}
          <div className={styles.categoryBottomPill}>{idea.category}</div>
        </div>
      </div>
    </div>
  );
};

export default MyIdeaInfo;
