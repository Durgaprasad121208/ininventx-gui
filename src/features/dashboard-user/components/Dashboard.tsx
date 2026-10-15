'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Row, Col, Card, Spin } from 'antd';
import {
    PlusCircle,
    ArrowRight,
    Lightbulb,
    Heart,
    Megaphone,
    Users,
    Clock,
    Pin,
    Paperclip,
    RefreshCw,
} from 'lucide-react';
import { SubmitButton, DarkButton } from '@/components/ui/app-button/AppButton';
import { useSelector } from 'react-redux';
import { type RootState } from '@/redux/store';
import { getDashboardData, initialDashboardData } from '../services/dashboardApi';
import { likeIdea, unlikeIdea } from '@/features/browse-ideas/services/browseIdeasApi';
import type { BackendDashboardResponse } from '../types/dashboard.types';
import styles from './Dashboard.module.css';

// SVG Tech graphics for idea thumbnails
const HandshakeThumbnail = () => (
    <svg
        viewBox="0 0 320 140"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={styles.ideaThumbnailSvg}
    >
        <rect width="320" height="140" fill="#040e1f" />
        <circle cx="160" cy="70" r="60" fill="url(#blue-radial)" opacity="0.4" />
        {/* Digital connected network nodes */}
        <path
            d="M60 40L110 70L160 50L210 80L260 50"
            stroke="#0284c7"
            strokeWidth="1.5"
            strokeDasharray="3 3"
        />
        <path
            d="M70 95L120 70L160 90L210 70L250 100"
            stroke="#06b6d4"
            strokeWidth="1.5"
        />
        {/* Clasping digital hands outline */}
        <path
            d="M100 80C115 65 140 60 160 75C175 60 200 65 215 80"
            stroke="#38bdf8"
            strokeWidth="2.5"
            strokeLinecap="round"
        />
        <circle cx="110" cy="70" r="4" fill="#38bdf8" />
        <circle cx="160" cy="75" r="5" fill="#06b6d4" />
        <circle cx="210" cy="70" r="4" fill="#38bdf8" />
        <circle cx="160" cy="50" r="3" fill="#60a5fa" />
        <circle cx="160" cy="90" r="3" fill="#60a5fa" />
        <defs>
            <radialGradient id="blue-radial" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#0284c7" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#040e1f" stopOpacity="0" />
            </radialGradient>
        </defs>
    </svg>
);

const RoboticArmThumbnail = () => (
    <svg
        viewBox="0 0 320 140"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={styles.ideaThumbnailSvg}
    >
        <rect width="320" height="140" fill="#040e1f" />
        <circle cx="100" cy="80" r="55" fill="url(#cyan-radial)" opacity="0.4" />
        {/* Robot joints & cyber cubes */}
        <path
            d="M70 120L95 80L135 60L165 75L190 55"
            stroke="#06b6d4"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <circle cx="70" cy="120" r="8" fill="#0f172a" stroke="#06b6d4" strokeWidth="2" />
        <circle cx="95" cy="80" r="7" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
        <circle cx="135" cy="60" r="6" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
        {/* Floating hologram cubes */}
        <rect x="200" y="50" width="16" height="16" rx="3" fill="#0284c7" opacity="0.8" />
        <rect x="230" y="40" width="14" height="14" rx="3" fill="#06b6d4" opacity="0.6" />
        <rect x="220" y="75" width="18" height="18" rx="4" fill="#38bdf8" opacity="0.7" />
        <circle cx="190" cy="55" r="4" fill="#67e8f9" />
        <line x1="165" y1="75" x2="220" y2="75" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="2 2" />
        <defs>
            <radialGradient id="cyan-radial" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#040e1f" stopOpacity="0" />
            </radialGradient>
        </defs>
    </svg>
);

const MarketplaceThumbnail = () => (
    <svg
        viewBox="0 0 320 140"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={styles.ideaThumbnailSvg}
    >
        <rect width="320" height="140" fill="#040e1f" />
        <circle cx="160" cy="70" r="60" fill="url(#glow-radial)" opacity="0.35" />
        {/* Interconnected skill nodes */}
        <circle cx="90" cy="70" r="14" stroke="#38bdf8" strokeWidth="2" fill="#0b1b36" />
        <circle cx="160" cy="45" r="16" stroke="#06b6d4" strokeWidth="2" fill="#0b1b36" />
        <circle cx="230" cy="70" r="14" stroke="#38bdf8" strokeWidth="2" fill="#0b1b36" />
        <circle cx="160" cy="95" r="15" stroke="#60a5fa" strokeWidth="2" fill="#0b1b36" />
        {/* Connection lines */}
        <line x1="90" y1="70" x2="160" y2="45" stroke="#0284c7" strokeWidth="1.8" />
        <line x1="160" y1="45" x2="230" y2="70" stroke="#0284c7" strokeWidth="1.8" />
        <line x1="230" y1="70" x2="160" y2="95" stroke="#0284c7" strokeWidth="1.8" />
        <line x1="160" y1="95" x2="90" y2="70" stroke="#0284c7" strokeWidth="1.8" />
        <line x1="90" y1="70" x2="230" y2="70" stroke="#06b6d4" strokeWidth="1.5" strokeDasharray="3 3" />
        <defs>
            <radialGradient id="glow-radial" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#0284c7" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#040e1f" stopOpacity="0" />
            </radialGradient>
        </defs>
    </svg>
);

export const Dashboard: React.FC = () => {
    const authState = useSelector((state: RootState) => state?.auth);
    const reduxUser = authState?.user || ((authState as any)?.id ? (authState as any) : null);

    const [isMounted, setIsMounted] = useState<boolean>(false);
    useEffect(() => {
        setIsMounted(true);
    }, []);

    const [localUser, setLocalUser] = useState<any>(null);
    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                const stored = localStorage.getItem('inventx_user');
                if (stored) {
                    setLocalUser(JSON.parse(stored));
                }
            } catch {
                // ignore
            }
        }
    }, []);

    const activeUser =
        reduxUser?.name || reduxUser?.email ? reduxUser : localUser;

    const [metrics, setMetrics] = useState<BackendDashboardResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [likesMap, setLikesMap] = useState<Record<string, number>>({});
    const [hasLikedMap, setHasLikedMap] = useState<Record<string, boolean>>({});

    const fetchDashboardMetrics = () => {
        setLoading(true);
        getDashboardData()
            .then((res: BackendDashboardResponse) => {
                if (res && typeof res === 'object') {
                    setMetrics(res);
                }
            })
            .catch((err) => {
                console.error('[Dashboard Error]:', err);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    useEffect(() => {
        // Initialize likes map from ideas
        const initialLikes: Record<string, number> = {};
        initialDashboardData.recentIdeas.forEach((idea) => {
            initialLikes[idea.id] = idea.likes;
        });
        setLikesMap(initialLikes);

        // Fetch live dashboard metrics directly
        fetchDashboardMetrics();
    }, []);

    const userName = isMounted
        ? (activeUser?.name || 'User')
        : 'User';

    const [likeLoadingMap, setLikeLoadingMap] = useState<Record<string, boolean>>({});

    const handleLike = async (ideaId: string) => {
        if (likeLoadingMap[ideaId]) return;

        const isLiked = Boolean(hasLikedMap[ideaId]);
        const nextLiked = !isLiked;
        const delta = nextLiked ? 1 : -1;

        setLikeLoadingMap((prev) => ({ ...prev, [ideaId]: true }));
        // Optimistic UI update
        setHasLikedMap((prev) => ({ ...prev, [ideaId]: nextLiked }));
        setLikesMap((prev) => ({
            ...prev,
            [ideaId]: Math.max(0, (prev[ideaId] || 0) + delta),
        }));

        try {
            if (nextLiked) {
                await likeIdea(ideaId);
            } else {
                await unlikeIdea(ideaId);
            }
        } catch (err) {
            console.error(`[Dashboard] Failed to toggle like for idea ${ideaId}:`, err);
            // Revert on error
            setHasLikedMap((prev) => ({ ...prev, [ideaId]: isLiked }));
            setLikesMap((prev) => ({
                ...prev,
                [ideaId]: Math.max(0, (prev[ideaId] || 0) - delta),
            }));
        } finally {
            setLikeLoadingMap((prev) => ({ ...prev, [ideaId]: false }));
        }
    };

    const getThumbnail = (type: string) => {
        switch (type) {
            case 'handshake':
                return <HandshakeThumbnail />;
            case 'robotics':
                return <RoboticArmThumbnail />;
            case 'marketplace':
            default:
                return <MarketplaceThumbnail />;
        }
    };

    const totalIdeas = metrics?.totalIdeas ?? 0;
    const maxStageScale = Math.max(totalIdeas, 1);

    const stages = [
        {
            id: 's1',
            stageName: 'S1 Idea Submission',
            count: metrics?.byStage?.IDEA_SUBMISSION ?? 0,
            maxCount: maxStageScale,
        },
        {
            id: 's2',
            stageName: 'S2 Screening',
            count: metrics?.byStage?.SCREENING ?? 0,
            maxCount: maxStageScale,
        },
        {
            id: 's3',
            stageName: 'S3 Presentation',
            count: metrics?.byStage?.PRESENTATION ?? 0,
            maxCount: maxStageScale,
        },
        {
            id: 's4',
            stageName: 'S4 Demo',
            count: metrics?.byStage?.DEMO ?? 0,
            maxCount: maxStageScale,
        },
    ];

    return (
        <Spin spinning={loading} size="large" classNames={{ root: styles.spinWrapper }}>
            <div className={styles.dashboardContainer}>
                {/* 1. Hero Banner */}
                <div className={styles.heroBanner}>
                    <div className={styles.heroLeft}>
                        <div className={styles.heroBadge}>{initialDashboardData.hero.hackathonBadge}</div>
                        <h1 className={styles.heroTitle} suppressHydrationWarning>
                            Welcome back, {userName}
                        </h1>
                        <div className={styles.heroTagline}>{initialDashboardData.hero.tagline}</div>
                        <div className={styles.heroDescription}>{initialDashboardData.hero.subdescription}</div>

                        <div className={styles.heroActions}>
                            <Link href="/submit-idea" style={{ textDecoration: 'none' }}>
                                <SubmitButton icon={<PlusCircle size={15} strokeWidth={2.2} />}>
                                    Submit an idea
                                </SubmitButton>
                            </Link>

                            <Link href="/browse-ideas" style={{ textDecoration: 'none' }}>
                                <DarkButton icon={<ArrowRight size={14} />}>
                                    Browse ideas
                                </DarkButton>
                            </Link>

                            <DarkButton
                                icon={<RefreshCw size={14} className={loading ? styles.spinningIcon : ''} />}
                                onClick={fetchDashboardMetrics}
                                disabled={loading}
                            >
                                {loading ? 'Refreshing...' : 'Refresh'}
                            </DarkButton>
                        </div>
                    </div>

                {/* Next Milestone Card inside Hero */}
                <div className={styles.milestoneCard}>
                    <div className={styles.milestoneHeader}>NEXT MILESTONE</div>
                    <div className={styles.milestoneTitle}>{initialDashboardData.hero.nextMilestone.title}</div>
                    <div className={styles.milestoneDate}>
                        {initialDashboardData.hero.nextMilestone.date} · {initialDashboardData.hero.nextMilestone.countdown}
                    </div>
                </div>
            </div>

            {/* 2. Quick Stats Grid */}
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                    <Card className={styles.statCard} variant="borderless">
                        <div className={styles.statCardHeader}>
                            <span className={styles.statLabel}>MY IDEAS</span>
                            <div className={styles.statIconBox}>
                                <Lightbulb size={18} strokeWidth={2} />
                            </div>
                        </div>
                        <div>
                            <div className={styles.statValue}>
                                {metrics ? `${metrics.myIdeas}/5` : '0/5'}
                            </div>
                            <div className={styles.statSubtitle}>
                                {metrics ? `${Math.max(5 - metrics.myIdeas, 0)} submissions left` : '5 submissions left'}
                            </div>
                        </div>
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card className={styles.statCard} variant="borderless">
                        <div className={styles.statCardHeader}>
                            <span className={styles.statLabel}>LIKES RECEIVED</span>
                            <div className={styles.statIconBox}>
                                <Heart size={18} strokeWidth={2} />
                            </div>
                        </div>
                        <div className={styles.statValue}>{metrics?.likesReceived ?? 0}</div>
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card className={styles.statCard} variant="borderless">
                        <div className={styles.statCardHeader}>
                            <span className={styles.statLabel}>IDEAS ACROSS GROUP</span>
                            <div className={styles.statIconBox}>
                                <Megaphone size={18} strokeWidth={2} />
                            </div>
                        </div>
                        <div className={styles.statValue}>{metrics?.totalIdeas ?? 0}</div>
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card className={styles.statCard} variant="borderless">
                        <div className={styles.statCardHeader}>
                            <span className={styles.statLabel}>ACTIVE IDEAS</span>
                            <div className={styles.statIconBox}>
                                <Users size={18} strokeWidth={2} />
                            </div>
                        </div>
                        <div className={styles.statValue}>{metrics?.myActiveIdeas ?? 0}</div>
                    </Card>
                </Col>
            </Row>

            {/* 3. Middle Section: Ideas by stage & Deadlines */}
            <Row gutter={[16, 16]}>
                <Col xs={24} md={14} lg={16}>
                    <Card className={styles.sectionCard} variant="borderless">
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>Ideas by stage</h2>
                        </div>

                        <div className={styles.stagesList}>
                            {stages.map((stage) => {
                                const percent = stage.maxCount > 0 ? Math.round((stage.count / stage.maxCount) * 100) : 0;
                                return (
                                    <div key={stage.id} className={styles.stageRow}>
                                        <div className={styles.stageMeta}>
                                            <span className={styles.stageName}>{stage.stageName}</span>
                                            <span className={styles.stageCount}>{stage.count}</span>
                                        </div>
                                        <div className={styles.stageProgressBar}>
                                            <div
                                                className={styles.stageProgressFill}
                                                style={{ width: `${percent}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                </Col>

                <Col xs={24} md={10} lg={8}>
                    <Card className={styles.sectionCard} variant="borderless">
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>Deadlines</h2>
                        </div>

                        <div className={styles.timelineList}>
                            {initialDashboardData.deadlines.map((milestone) => (
                                <div key={milestone.id} className={styles.timelineItem}>
                                    <div className={styles.timelineIndicator}>
                                        {milestone.isCurrent ? (
                                            <span className={styles.timelineIndicatorActive}>
                                                <Clock size={16} />
                                            </span>
                                        ) : (
                                            <div className={styles.timelineIndicatorRing} />
                                        )}
                                    </div>

                                    <div className={styles.timelineContent}>
                                        <div className={styles.timelineHeaderRow}>
                                            <span className={styles.timelineTitle}>{milestone.title}</span>
                                            {milestone.countdown && (
                                                <span className={styles.timelineTag}>{milestone.countdown}</span>
                                            )}
                                        </div>
                                        <div className={styles.timelineDate}>{milestone.date}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* 4. Bottom Section: Recent ideas & Important announcements */}
            <Row gutter={[16, 16]}>
                <Col xs={24} md={14} lg={16}>
                    <div style={{ marginBottom: '12px' }} className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Recent ideas</h2>
                        <Link href="/browse-ideas" className={styles.viewAllLink}>
                            View all
                        </Link>
                    </div>

                    <div className={styles.ideasGrid}>
                        {initialDashboardData.recentIdeas.map((idea) => {
                            const isLiked = hasLikedMap[idea.id];
                            const likesCount = likesMap[idea.id] ?? idea.likes;

                            return (
                                <div key={idea.id} className={styles.ideaCard}>
                                    {/* Thumbnail Banner */}
                                    <div className={styles.ideaThumbnailWrapper}>
                                        {getThumbnail(idea.imageThumbnail)}
                                        <div className={styles.ideaThumbnailBadges}>
                                            <span className={styles.stageBadgePill}>{idea.stage}</span>
                                            {idea.stageBadge && (
                                                <span className={styles.demoBadgePill}>{idea.stageBadge}</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Idea Card Body */}
                                    <div className={styles.ideaBody}>
                                        <div className={styles.tagsRow}>
                                            <span className={styles.categoryTag}>{idea.category}</span>
                                            <span className={styles.statusTag}>{idea.status}</span>
                                        </div>

                                        <h3 className={styles.ideaTitle}>{idea.title}</h3>
                                        <p className={styles.ideaDescription}>{idea.description}</p>

                                        <div className={styles.ideaAuthorSection}>
                                            <span className={styles.authorName}>{idea.author}</span>
                                            <div className={styles.teamMeta}>
                                                <span
                                                    className={styles.statusDot}
                                                    style={{ backgroundColor: idea.teamDotColor }}
                                                />
                                                <span>{idea.company}</span>
                                                <span>· {idea.team}</span>
                                            </div>
                                        </div>

                                        <div className={styles.ideaFooter}>
                                            <span>{idea.date}</span>
                                            <div className={styles.ideaActionsRight}>
                                                {idea.attachments && (
                                                    <span
                                                        style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}
                                                    >
                                                        <Paperclip size={13} />
                                                        <span>{idea.attachments}</span>
                                                    </span>
                                                )}

                                                <button
                                                    type="button"
                                                    className={styles.likeBtn}
                                                    disabled={likeLoadingMap[idea.id]}
                                                    onClick={() => handleLike(idea.id)}
                                                    aria-label={`Like ${idea.title}`}
                                                    style={{ color: isLiked ? '#ef4444' : undefined }}
                                                >
                                                    <Heart
                                                        size={14}
                                                        fill={isLiked ? '#ef4444' : 'none'}
                                                        stroke={isLiked ? '#ef4444' : 'currentColor'}
                                                    />
                                                    <span>{likesCount}</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Col>

                <Col xs={24} md={10} lg={8}>
                    <div style={{ marginBottom: '12px' }} className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Important announcements</h2>
                    </div>

                    <div className={styles.announcementsList}>
                        {initialDashboardData.announcements.map((ann) => (
                            <div key={ann.id} className={styles.announcementCard}>
                                <div className={styles.announcementHeader}>
                                    <Pin size={14} className={styles.pinIcon} />
                                    {ann.type === 'critical' ? (
                                        <span className={styles.announcementBadgeCritical}>critical</span>
                                    ) : (
                                        <span className={styles.announcementBadgeImportant}>important</span>
                                    )}
                                    <span className={styles.announcementDate}>{ann.date}</span>
                                </div>
                                <div className={styles.announcementTitle}>{ann.title}</div>
                            </div>
                        ))}
                    </div>
                </Col>
            </Row>
        </div>
        </Spin>
    );
};

export default Dashboard;
