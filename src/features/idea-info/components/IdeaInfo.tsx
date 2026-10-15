'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams, useParams } from 'next/navigation';
import { Card, Input, Select, Tooltip, App, Spin, Modal } from 'antd';
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
  Download,
} from 'lucide-react';
import {
  AppButton,
  SubmitButton,
  CancelButton,
  DarkButton,
} from '@/components/ui/app-button/AppButton';
import {
  getOrganizerIdeaDetail,
  postStageTransition,
  updateOrganizerIdeaMetadata,
} from '../services/ideaInfoApi';
import { likeIdea, unlikeIdea } from '@/features/browse-ideas/services/browseIdeasApi';
import type {
  IdeaDetailData,
  StageCode,
  OrganizerDecision,
  BackendOrganizerIdeaDetail,
  NormalizedTeamMember,
  StageHistoryEntry,
  StageTransitionPayload,
} from '../types/ideaInfo.types';
import styles from './IdeaInfo.module.css';

const { TextArea } = Input;

export interface IdeaInfoProps {
  ideaId?: string;
}

const CATEGORY_MAP: Record<string, string> = {
  INDUSTRIAL_AUTOMATION: 'Industrial Automation & Control',
  DIGITAL_MANUFACTURING: 'Digital Manufacturing & Smart Factories',
  DIGITAL_TWINS: 'Digital Twins',
  MODELLING_SIMULATION: 'Modelling & Simulation',
  AR_VR: 'Augmented & Virtual Reality (AR/VR)',
  AI_DATA_ANALYTICS: 'Artificial Intelligence & Data Analytics',
  ROBOTICS: 'Robotics & Intelligent Systems',
  PRODUCT_PROCESS_INNOVATION: 'Product & Process Innovation',
  QUALITY_RELIABILITY: 'Quality & Reliability',
  ENERGY_SUSTAINABILITY: 'Energy Efficiency & Sustainability',
  SAFETY_ERGONOMICS: 'Safety & Ergonomics',
  CUSTOMER_BUSINESS_SOLUTIONS: 'Customer & Business Solutions',
};

const CATEGORY_OPTIONS = Object.entries(CATEGORY_MAP).map(([value, label]) => ({
  value,
  label,
}));

const formatCategory = (cat?: string): string => {
  if (!cat) return 'General';
  const key = cat.toUpperCase().replace(/[^A-Z0-9]+/g, '_');
  if (CATEGORY_MAP[key]) return CATEGORY_MAP[key];
  return cat.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
};

const formatStageInfo = (stage?: string): { code: StageCode; name: string } => {
  const s = String(stage || '').toUpperCase();
  if (s.includes('S4') || s.includes('DEMO')) return { code: 'S4', name: 'Demo' };
  if (s.includes('S3') || s.includes('PRESENTATION')) return { code: 'S3', name: 'Presentation' };
  if (s.includes('S2') || s.includes('SCREENING')) return { code: 'S2', name: 'Screening' };
  return { code: 'S1', name: 'Idea Submission' };
};

const deriveCompany = (email?: string, department?: string): string => {
  const em = (email || '').toLowerCase();
  if (em.includes('enggis.com')) return 'MANTIX';
  if (em.includes('nexsys.co.in')) return 'Nexsys Process Automations';
  if (em.includes('stability.co')) return 'Stability';
  if (department) return department;
  return 'MANTIX';
};

const getCompanyDotColor = (company?: string): string => {
  const c = (company || '').toLowerCase();
  if (c.includes('nexsys')) return '#10b981';
  if (c.includes('stability')) return '#f59e0b';
  return '#38bdf8';
};

const formatDate = (isoString?: string): string => {
  if (!isoString) return 'Recently';
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

const computeNextStage = (stageCode: StageCode): string => {
  switch (stageCode) {
    case 'S1':
      return 'SCREENING';
    case 'S2':
      return 'PRESENTATION';
    case 'S3':
      return 'DEMO';
    default:
      return 'SCREENING';
  }
};

interface DecisionConfigItem {
  title: string;
  badgeBg: string;
  badgeColor: string;
  icon: React.ReactNode;
  iconSmall: React.ReactNode;
  templates: string[];
  confirmVariant: 'primary' | 'cancel' | 'dark';
  confirmText: string;
}

const DECISION_CONFIG: Record<OrganizerDecision, DecisionConfigItem> = {
  PROMOTE: {
    title: 'Promote Stage Transition',
    badgeBg: 'rgba(14, 165, 233, 0.15)',
    badgeColor: '#38bdf8',
    icon: <ArrowUpRight size={20} color="#38bdf8" />,
    iconSmall: <ArrowUpRight size={14} />,
    templates: [
      'Meets all stage evaluation criteria and approved to proceed to next stage.',
      'Strong prototype submission with verified technical feasibility.',
      'High judging score achieved; ready for presentation round.',
      'All deliverables verified and compliant with competition guidelines.',
    ],
    confirmVariant: 'primary',
    confirmText: 'Promote Stage',
  },
  APPROVE: {
    title: 'Approve Submission',
    badgeBg: 'rgba(16, 185, 129, 0.15)',
    badgeColor: '#10b981',
    icon: <CheckCircle2 size={20} color="#10b981" />,
    iconSmall: <CheckCircle2 size={14} />,
    templates: [
      'Idea submission meets all innovation standards and quality guidelines.',
      'Solid proposal with well-defined deliverables and execution strategy.',
      'Review panel unanimously recommends formal stage approval.',
      'Successfully verified and addressed all preliminary feedback.',
    ],
    confirmVariant: 'primary',
    confirmText: 'Confirm Approval',
  },
  REQUEST_CHANGES: {
    title: 'Request Changes',
    badgeBg: 'rgba(245, 158, 11, 0.15)',
    badgeColor: '#f59e0b',
    icon: <RotateCcw size={20} color="#f59e0b" />,
    iconSmall: <RotateCcw size={14} />,
    templates: [
      'Please refine target customer segments and provide market validation data.',
      'Provide more details on implementation feasibility and budget estimates.',
      'Clarify team member roles, responsibilities, and resource allocation.',
      'Update the problem statement with specific measurable impact metrics.',
    ],
    confirmVariant: 'primary',
    confirmText: 'Request Changes',
  },
  REJECT: {
    title: 'Reject Idea Submission',
    badgeBg: 'rgba(239, 68, 68, 0.15)',
    badgeColor: '#ef4444',
    icon: <XCircle size={20} color="#ef4444" />,
    iconSmall: <XCircle size={14} />,
    templates: [
      'Does not align with current competition strategic focus areas.',
      'Scope lacks sufficient technical or commercial feasibility at this time.',
      'Insufficient problem justification and differentiation from existing solutions.',
      'Eligibility criteria not met as outlined in official guidelines.',
    ],
    confirmVariant: 'cancel',
    confirmText: 'Confirm Rejection',
  },
  ARCHIVE: {
    title: 'Archive Submission',
    badgeBg: 'rgba(148, 163, 184, 0.15)',
    badgeColor: '#94a3b8',
    icon: <Archive size={20} color="#94a3b8" />,
    iconSmall: <Archive size={14} />,
    templates: [
      'Duplicate submission of an existing active proposal.',
      'Withdrawn or superseded by a newer version submitted by the team.',
      'Archived per organizing committee lifecycle review.',
      'Project discontinued upon idea owner request.',
    ],
    confirmVariant: 'dark',
    confirmText: 'Archive Idea',
  },
  RESTORE: {
    title: 'Restore Idea to Pipeline',
    badgeBg: 'rgba(20, 184, 166, 0.15)',
    badgeColor: '#14b8a6',
    icon: <RotateCcw size={20} color="#14b8a6" />,
    iconSmall: <RotateCcw size={14} />,
    templates: [
      'Re-evaluated upon organizer review; restoring to active pipeline.',
      'Required clarifications submitted by team; resuming evaluation.',
      'Accidentally archived; restoring to previous stage.',
      'Restored for supplementary assessment by judging panel.',
    ],
    confirmVariant: 'primary',
    confirmText: 'Restore Idea',
  },
};

const normalizeBackendIdea = (raw: BackendOrganizerIdeaDetail): IdeaDetailData => {
  const stageInfo = formatStageInfo(raw.stage);
  const categoryLabel = formatCategory(raw.category);

  // Normalize team members
  let members: NormalizedTeamMember[] = [];
  if (Array.isArray(raw.teamMembers) && raw.teamMembers.length > 0) {
    members = raw.teamMembers.map((m, idx) => ({
      name: m.name || `Member ${idx + 1}`,
      email: m.email || '',
      department: m.department || '',
      company: deriveCompany(m.email, m.department),
      roleInTeam: m.roleInTeam || (idx === 0 ? 'Owner' : 'Contributor'),
      isOwner: idx === 0 || m.roleInTeam?.toLowerCase() === 'owner',
    }));
  } else {
    members = [
      {
        name: raw.ownerName || 'Idea Owner',
        department: '',
        company: 'MANTIX',
        roleInTeam: 'Owner',
        isOwner: true,
      },
    ];
  }

  const primaryCompany = members[0]?.company || 'MANTIX';
  const companyDotColor = getCompanyDotColor(primaryCompany);
  const uniqueCompanies = Array.from(new Set(members.map((m) => m.company).filter(Boolean)));
  const teamMembersCount = `${members.length}/4 members · ${
    uniqueCompanies.length > 1
      ? `Cross-company: ${uniqueCompanies.join(', ')}`
      : `${primaryCompany} team`
  }`;

  // Normalize stage history
  let history: StageHistoryEntry[] = [];
  if (Array.isArray(raw.stageHistory) && raw.stageHistory.length > 0) {
    history = raw.stageHistory.map((h, idx) => {
      const fromSt = formatStageInfo(h.fromStage).name;
      const toSt = formatStageInfo(h.toStage).name;
      const dec = h.decision || 'UPDATE';
      const actionLabel =
        fromSt === toSt ? `${dec} · ${toSt}` : `${dec} · ${fromSt} → ${toSt}`;
      return {
        id: h.id || `hist-${idx}`,
        action: actionLabel,
        reason: h.reason,
        author: h.changedByName || 'Organizer',
        timestamp: formatDate(h.changedAt),
        decision: h.decision,
      };
    });
  } else {
    history = [
      {
        id: 'hist-submit',
        action: 'Submitted → Idea Submission',
        author: raw.ownerName || 'Idea Owner',
        timestamp: formatDate(raw.createdAt),
      },
    ];
  }

  // Normalize attachments
  let attList: Array<{ id: string; name: string; size?: string; url?: string }> = [];
  if (Array.isArray(raw.attachments) && raw.attachments.length > 0) {
    attList = raw.attachments.map((att: any, idx: number) => {
      if (typeof att === 'string') {
        return { id: `att-${idx}`, name: att };
      }
      return {
        id: att.id || `att-${idx}`,
        name: att.fileName || att.name || `attachment-${idx + 1}`,
        size: att.sizeBytes ? `${Math.round(att.sizeBytes / 1024)} KB` : undefined,
        url: att.url,
      };
    });
  }

  return {
    id: raw.id,
    title: raw.title || 'Untitled Idea',
    summary: raw.summary || '',
    description: raw.description || raw.summary || '',
    targetCustomer: raw.targetCustomer || '',
    businessImpact: raw.businessImpact || '',
    category: categoryLabel,
    rawCategory: raw.category || 'INDUSTRIAL_AUTOMATION',
    rawStage: raw.stage,
    stageCode: stageInfo.code,
    stageName: stageInfo.name,
    status: raw.status || 'DRAFT',
    isDemoContent: Boolean(raw.tags?.includes('demo') || raw.title?.toLowerCase().includes('demo')),
    likes: raw.likeCount ?? 0,
    hasLiked: Boolean(raw.likedByMe),
    createdAt: formatDate(raw.createdAt),
    updatedAt: formatDate(raw.updatedAt || raw.createdAt),
    teamName: raw.title ? `${raw.title} Team` : 'Idea Team',
    ownerName: raw.ownerName || 'Idea Owner',
    ownerRole: 'Owner',
    company: primaryCompany,
    companyDotColor,
    teamMembersCount,
    teamMembers: members,
    attachments: attList,
    stageHistory: history,
    internalNotes: raw.adminNotes || '',
    tags: raw.tags || [],
    allowedDecisions: raw.allowedDecisions || [
      'PROMOTE',
      'APPROVE',
      'REQUEST_CHANGES',
      'REJECT',
      'ARCHIVE',
      'RESTORE',
    ],
    nextStage: raw.nextStage,
  };
};

export const IdeaInfo: React.FC<IdeaInfoProps> = ({ ideaId }) => {
  const { message } = App.useApp();
  const searchParams = useSearchParams();
  const routeParams = useParams();

  const effectiveId =
    ideaId ||
    (routeParams?.id as string) ||
    searchParams?.get('id') ||
    '';

  const [idea, setIdea] = useState<IdeaDetailData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [likes, setLikes] = useState<number>(0);
  const [hasLiked, setHasLiked] = useState<boolean>(false);
  const [likeLoading, setLikeLoading] = useState<boolean>(false);

  // Administrative metadata states
  const [category, setCategory] = useState<string>('INDUSTRIAL_AUTOMATION');
  const [tagsInput, setTagsInput] = useState<string>('');
  const [internalNotes, setInternalNotes] = useState<string>('');
  const [saveMetaLoading, setSaveMetaLoading] = useState<boolean>(false);

  // Decision Modal State
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [activeDecision, setActiveDecision] = useState<OrganizerDecision | null>(null);
  const [decisionReason, setDecisionReason] = useState<string>('');
  const [decisionLoading, setDecisionLoading] = useState<boolean>(false);

  // Fetch Idea Details from GET /api/organizer/ideas/{id}
  const loadIdea = useCallback(async () => {
    if (!effectiveId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const raw = await getOrganizerIdeaDetail(effectiveId);
      if (raw) {
        const normalized = normalizeBackendIdea(raw);
        setIdea(normalized);
        setLikes(normalized.likes);
        setHasLiked(normalized.hasLiked);
        setCategory(normalized.rawCategory);
        setTagsInput(normalized.tags ? normalized.tags.join(', ') : '');
        setInternalNotes(normalized.internalNotes || '');
      }
    } catch (err) {
      console.error('[IdeaInfo] Failed to fetch organizer idea details:', err);
      message.error('Failed to load idea details from server');
    } finally {
      setLoading(false);
    }
  }, [effectiveId, message]);

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
      console.error(`[IdeaInfo] Failed to toggle like:`, err);
      setHasLiked(isCurrentlyLiked);
      setLikes((prev) => Math.max(0, prev - delta));
    } finally {
      setLikeLoading(false);
    }
  };

  // Open Decision Confirmation Modal
  const openDecisionModal = (decision: OrganizerDecision) => {
    setActiveDecision(decision);
    setDecisionReason('');
    setModalOpen(true);
  };

  // Submit Stage Transition via POST /api/organizer/ideas/{id}/stage-transitions
  const handleConfirmDecision = async () => {
    if (!effectiveId || !activeDecision) return;

    const trimmedReason = decisionReason.trim();
    if (trimmedReason.length < 5) {
      message.warning('Please enter a review reason of at least 5 characters');
      return;
    }

    setDecisionLoading(true);
    try {
      const payload: StageTransitionPayload = {
        decision: activeDecision,
        reason: trimmedReason,
      };

      if (activeDecision === 'PROMOTE') {
        payload.toStage =
          idea?.nextStage || (idea?.stageCode ? computeNextStage(idea.stageCode) : undefined);
      }

      const res = await postStageTransition(effectiveId, payload);

      if (res) {
        const updated = normalizeBackendIdea(res);
        setIdea(updated);
        setLikes(updated.likes);
        setCategory(updated.rawCategory);
      } else {
        await loadIdea();
      }

      message.success(
        `Decision successfully recorded: ${DECISION_CONFIG[activeDecision]?.title || activeDecision}`
      );
      setModalOpen(false);
      setDecisionReason('');
    } catch (err: any) {
      console.error('[IdeaInfo] Failed to submit stage transition:', err);
      const serverMsg =
        err?.data?.message ||
        err?.response?.data?.message ||
        err?.message ||
        'Failed to record review decision';
      message.error(serverMsg);
    } finally {
      setDecisionLoading(false);
    }
  };

  // Save Administrative Metadata via PUT /api/organizer/ideas/{id}
  const handleSaveMetadata = async () => {
    if (!effectiveId) return;

    setSaveMetaLoading(true);
    try {
      const parsedTags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const res = await updateOrganizerIdeaMetadata(effectiveId, {
        category,
        adminNotes: internalNotes,
        tags: parsedTags,
      });

      if (res) {
        const updated = normalizeBackendIdea(res);
        setIdea(updated);
        setCategory(updated.rawCategory);
      }
      message.success('Administrative metadata saved successfully');
    } catch (err: any) {
      console.error('[IdeaInfo] Failed to save metadata:', err);
      message.error('Failed to save administrative metadata');
    } finally {
      setSaveMetaLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Spin size="large" />
        <span style={{ color: '#94a3b8', fontSize: 13, marginTop: 12 }}>
          Loading idea details...
        </span>
      </div>
    );
  }

  if (!idea) {
    return (
      <div className={styles.emptyContainer}>
        <p style={{ color: '#cbd5e1', fontSize: 16, fontWeight: 600 }}>Idea not found</p>
        <Link href="/organizer/manage-ideas" className={styles.backLink}>
          <ArrowLeft size={14} />
          <span>Return to Manage ideas</span>
        </Link>
      </div>
    );
  }

  const currentLevel = stageOrder[idea.stageCode] || 1;

  // Compute label for promote button
  const nextStageName = idea.nextStage
    ? formatStageInfo(idea.nextStage).name
    : idea.stageCode === 'S1'
    ? 'Screening'
    : idea.stageCode === 'S2'
    ? 'Presentation'
    : idea.stageCode === 'S3'
    ? 'Demo'
    : '';

  const promoteBtnText = nextStageName
    ? `Promote to ${nextStageName}`
    : 'Promote';

  const activeConfig = activeDecision ? DECISION_CONFIG[activeDecision] : null;
  const trimmedReasonLength = decisionReason.trim().length;
  const isReasonValid = trimmedReasonLength >= 5 && trimmedReasonLength <= 2000;

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

            {idea.targetCustomer && (
              <>
                <h3 className={styles.subSectionHeader}>PROBLEM STATEMENT</h3>
                <p className={styles.subSectionText}>{idea.targetCustomer}</p>
              </>
            )}

            {idea.businessImpact && (
              <>
                <h3 className={styles.subSectionHeader}>EXPECTED BUSINESS VALUE</h3>
                <p className={styles.subSectionText}>{idea.businessImpact}</p>
              </>
            )}
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
              <p className={styles.attachmentsEmpty}>No attachments uploaded.</p>
            ) : (
              idea.attachments.map((file) => (
                <div key={file.id} className={styles.attachmentItem}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                    <Paperclip size={14} style={{ color: '#29c9d1', flexShrink: 0 }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {file.name}
                    </span>
                    {file.size && (
                      <span style={{ color: '#64748b', fontSize: 11 }}>({file.size})</span>
                    )}
                  </div>
                  {file.url && (
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.downloadLink}
                      aria-label={`Download ${file.name}`}
                    >
                      <Download size={14} />
                    </a>
                  )}
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

            {/* 1. Promote Primary Button (Full Width) */}
            <AppButton
              variant="primary"
              className={styles.promotePrimaryBtn}
              onClick={() => openDecisionModal('PROMOTE')}
              disabled={idea.stageCode === 'S4'}
              icon={<ArrowUpRight size={15} />}
            >
              {promoteBtnText}
            </AppButton>

            {/* 2. 2x2 Actions Grid: Approve, Request changes, Reject, Archive */}
            <div className={styles.actionsGrid}>
              <AppButton
                variant="dark"
                className={styles.actionBtn}
                onClick={() => openDecisionModal('APPROVE')}
                icon={<CheckCircle2 size={14} />}
              >
                Approve
              </AppButton>

              <AppButton
                variant="dark"
                className={styles.actionBtn}
                onClick={() => openDecisionModal('REQUEST_CHANGES')}
                icon={<RotateCcw size={14} />}
              >
                Request changes
              </AppButton>

              <AppButton
                variant="cancel"
                className={`${styles.actionBtn} ${styles.actionBtnReject}`}
                onClick={() => openDecisionModal('REJECT')}
                icon={<XCircle size={14} />}
              >
                Reject
              </AppButton>

              <AppButton
                variant="dark"
                className={styles.actionBtn}
                onClick={() => openDecisionModal('ARCHIVE')}
                icon={<Archive size={14} />}
              >
                Archive
              </AppButton>
            </div>

            {/* 3. Restore Action Button (Full Width) */}
            <AppButton
              variant="dark"
              className={styles.restoreBtn}
              onClick={() => openDecisionModal('RESTORE')}
              icon={<RotateCcw size={14} />}
            >
              Restore
            </AppButton>

            {/* Administrative Metadata Form */}
            <div className={styles.adminMetadataSection}>
              <h3 className={styles.adminMetadataTitle}>Administrative metadata</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ fontSize: 11, color: '#94a3b8' }}>Category</span>
                <Select
                  value={category}
                  onChange={setCategory}
                  className={styles.adminSelect}
                  options={CATEGORY_OPTIONS}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ fontSize: 11, color: '#94a3b8' }}>Tags</span>
                <Input
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="e.g. ai, smart-factory, prototype"
                  className={styles.adminInput}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ fontSize: 11, color: '#94a3b8' }}>Internal organizer notes</span>
                <TextArea
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  rows={3}
                  placeholder="Private organizer review notes..."
                  className={styles.adminTextarea}
                />
              </div>

              <AppButton
                variant="dark"
                className={styles.saveMetaBtn}
                onClick={handleSaveMetadata}
                loading={saveMetaLoading}
              >
                Save metadata
              </AppButton>
            </div>
          </Card>

          {/* Team / Author Card */}
          <Card className={styles.sectionCard} variant="borderless">
            <h2 className={styles.teamCardTitle}>
              <Users size={16} />
              <span>{idea.teamName}</span>
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {idea.teamMembers.map((member, idx) => (
                <div key={`${member.name}-${idx}`} className={styles.authorSection}>
                  <div className={styles.authorRow}>
                    <span>{member.name}</span>
                    {member.isOwner && <span className={styles.ownerPill}>Owner</span>}
                  </div>
                  {member.company && (
                    <div className={styles.companyRow}>
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

            <div className={styles.teamFooter}>{idea.teamMembersCount}</div>
          </Card>
        </div>
      </div>

      {/* Decision Confirmation Modal */}
      <Modal
        open={modalOpen}
        onCancel={() => !decisionLoading && setModalOpen(false)}
        centered
        destroyOnHidden
        width={520}
        className={styles.decisionModal}
        title={null}
        footer={null}
      >
        {activeDecision && activeConfig && (
          <div className={styles.modalContent}>
            {/* Modal Header */}
            <div className={styles.modalHeader}>
              <div
                className={styles.modalIconBox}
                style={{
                  background: activeConfig.badgeBg,
                  borderColor: activeConfig.badgeColor,
                }}
              >
                {activeConfig.icon}
              </div>
              <div className={styles.modalTitleCol}>
                <div className={styles.modalTitleRow}>
                  <h3 className={styles.modalTitleText}>{activeConfig.title}</h3>
                  <span
                    className={styles.modalDecisionBadge}
                    style={{
                      background: activeConfig.badgeBg,
                      color: activeConfig.badgeColor,
                    }}
                  >
                    {activeDecision}
                  </span>
                </div>
                <p className={styles.modalSubtitleText}>
                  Every decision is recorded with reviewer credentials, timestamp, and audit trail.
                </p>
              </div>
            </div>

            {/* Reason Textarea & Counter */}
            <div className={styles.modalInputSection}>
              <div className={styles.modalInputLabelRow}>
                <label className={styles.modalInputLabel}>
                  Reason / Justification <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <span
                  className={`${styles.charCounter} ${
                    isReasonValid ? styles.counterValid : styles.counterInvalid
                  }`}
                >
                  {isReasonValid
                    ? `✓ ${trimmedReasonLength}/2000 characters`
                    : `${trimmedReasonLength}/2000 (minimum 5 required)`}
                </span>
              </div>
              <TextArea
                rows={4}
                value={decisionReason}
                onChange={(e) => setDecisionReason(e.target.value)}
                placeholder="Enter detailed reason (at least 5 characters)..."
                className={styles.modalTextarea}
                maxLength={2000}
                disabled={decisionLoading}
              />
            </div>

            {/* Modal Actions Footer */}
            <div className={styles.modalFooter}>
              <AppButton
                variant="cancel"
                onClick={() => setModalOpen(false)}
                disabled={decisionLoading}
              >
                Cancel
              </AppButton>
              <AppButton
                variant={activeConfig.confirmVariant}
                className={activeDecision === 'REJECT' ? styles.modalRejectBtn : ''}
                onClick={handleConfirmDecision}
                loading={decisionLoading}
                disabled={!isReasonValid || decisionLoading}
                icon={activeConfig.iconSmall}
              >
                {activeConfig.confirmText}
              </AppButton>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default IdeaInfo;
