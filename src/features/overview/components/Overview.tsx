'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Card, Spin, Tooltip } from 'antd';
import {
  Lightbulb,
  Users,
  Heart,
  Activity,
  Calendar,
  ArrowRight,
  RotateCw,
} from 'lucide-react';
import * as echarts from 'echarts';
import { SubmitButton } from '@/components/ui/app-button/AppButton';
import { useTheme } from '@/providers/theme/ThemeProvider';
import { getOverviewData } from '../services/overviewApi';
import type {
  BackendOverviewResponse,
  OverviewData,
  CategoryData,
  DeadlineItem,
  CompanyParticipation,
  ActivityItem,
} from '../types/overview.types';
import styles from './Overview.module.css';

const CATEGORY_NAMES: Record<string, string> = {
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

const PROGRAMME_MILESTONES = [
  { id: 'dl-1', title: 'Inauguration', target: new Date('2026-10-16T09:00:00') },
  { id: 'dl-2', title: 'Submission Deadline', target: new Date('2026-10-30T23:59:59') },
  { id: 'dl-3', title: 'Screening & Selection', target: new Date('2026-11-02T18:00:00') },
  { id: 'dl-4', title: 'Presentation Day', target: new Date('2026-11-10T18:00:00') },
  { id: 'dl-5', title: 'Demo Day', target: new Date('2026-12-15T18:00:00') },
];

const formatDate = (d: Date): string => {
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const getDeadlineBadge = (target: Date): { badge?: string; isUpcoming?: boolean } => {
  const now = new Date();
  const diffTime = target.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return { badge: 'Today', isUpcoming: true };
  if (diffDays === 1) return { badge: 'In 1 day', isUpcoming: true };
  if (diffDays > 1 && diffDays <= 7) return { badge: `In ${diffDays} days`, isUpcoming: true };
  if (diffDays > 7 && diffDays <= 14) return { badge: `In ${diffDays} days`, isUpcoming: false };
  if (diffDays < 0) return { badge: 'Completed', isUpcoming: false };
  return { isUpcoming: false };
};

/**
 * Normalizes backend overview API response to frontend OverviewData structure
 */
const normalizeOverviewData = (raw: BackendOverviewResponse): OverviewData => {
  const kpis = {
    submittedIdeas: raw.submittedIdeas ?? raw.byStatus?.SUBMITTED ?? 0,
    participants: raw.participants ?? 0,
    totalLikes: raw.totalLikes ?? 0,
    inScreening: raw.inScreening ?? raw.byStage?.SCREENING ?? raw.byStatus?.UNDER_REVIEW ?? 0,
    totalIdeas: raw.totalIdeas ?? 0,
  };

  const stages = [
    {
      stage: 'Idea Submission',
      stageCode: 'IDEA_SUBMISSION',
      count: raw.byStage?.IDEA_SUBMISSION ?? 0,
    },
    {
      stage: 'Screening',
      stageCode: 'SCREENING',
      count: raw.byStage?.SCREENING ?? 0,
    },
    {
      stage: 'Presentation',
      stageCode: 'PRESENTATION',
      count: raw.byStage?.PRESENTATION ?? 0,
    },
    {
      stage: 'Demo',
      stageCode: 'DEMO',
      count: raw.byStage?.DEMO ?? 0,
    },
  ];

  const categories: CategoryData[] = Object.keys(CATEGORY_NAMES).map((key) => ({
    categoryCode: key,
    category: CATEGORY_NAMES[key],
    count: raw.byCategory?.[key] ?? 0,
  }));

  // Append any extra categories from backend
  if (raw.byCategory) {
    Object.entries(raw.byCategory).forEach(([key, count]) => {
      if (!CATEGORY_NAMES[key]) {
        categories.push({
          categoryCode: key,
          category: key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
          count: typeof count === 'number' ? count : 0,
        });
      }
    });
  }

  // Company participation
  let companies: CompanyParticipation[] = [];
  if (raw.byCompany && typeof raw.byCompany === 'object') {
    companies = Object.entries(raw.byCompany).map(([company, count]) => ({
      company,
      count: typeof count === 'number' ? count : 0,
    }));
  } else {
    companies = [
      { company: 'MANTIX', count: 0 },
      { company: 'Nexsys Process Automations', count: 0 },
      { company: 'Stability', count: 0 },
    ];
  }

  // Deadlines
  let deadlines: DeadlineItem[] = [];
  if (Array.isArray(raw.upcomingDeadlines) && raw.upcomingDeadlines.length > 0) {
    deadlines = raw.upcomingDeadlines.map((dl, idx) => ({
      id: dl.id || `dl-${idx}`,
      title: dl.title || 'Milestone',
      date: dl.date || dl.deadline || 'TBD',
      badge: dl.badge,
      isUpcoming: dl.isUpcoming,
    }));
  } else {
    deadlines = PROGRAMME_MILESTONES.map((m) => {
      const { badge, isUpcoming } = getDeadlineBadge(m.target);
      return {
        id: m.id,
        title: m.title,
        date: formatDate(m.target),
        badge,
        isUpcoming,
      };
    });
  }

  const activities: ActivityItem[] = [
    {
      id: 'act-1',
      text: 'Programme launched · Idea submissions open to all employees',
      timeAgo: 'Recently',
    },
  ];

  return {
    kpis,
    stages,
    categories,
    companies,
    deadlines,
    activities,
  };
};

export const Overview: React.FC = () => {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  const { themeMode } = useTheme();

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const rawRes = await getOverviewData();
      if (rawRes) {
        const normalized = normalizeOverviewData(rawRes);
        setData(normalized);
      }
    } catch (err) {
      console.error('[Overview Component] Error loading data from API:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ECharts Initialization and Lifecycle Management
  useEffect(() => {
    if (!chartRef.current || !data) return;

    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }
    const chart = chartInstance.current;
    const isDark = themeMode === 'dark';

    const stageCategories = data.stages.map((s) => s.stage);
    const stageValues = data.stages.map((s) => s.count);
    const maxVal = Math.max(...stageValues, 0);

    const option: echarts.EChartsOption = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
          shadowStyle: {
            color: isDark ? 'rgba(56, 189, 248, 0.08)' : 'rgba(2, 132, 199, 0.08)',
          },
        },
        backgroundColor: isDark ? '#08101e' : '#ffffff',
        borderColor: isDark ? 'rgba(56, 189, 248, 0.3)' : '#cbd5e1',
        textStyle: {
          color: isDark ? '#f1f5f9' : '#0f172a',
          fontSize: 12,
        },
        formatter: (params: any) => {
          const item = Array.isArray(params) ? params[0] : params;
          return `<strong>${item.name}</strong><br/>Ideas: <span style="color: #38bdf8; font-weight: 700;">${item.value}</span>`;
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '8%',
        top: '12%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: stageCategories,
        axisLine: {
          lineStyle: {
            color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          },
        },
        axisTick: { show: false },
        axisLabel: {
          color: isDark ? '#94a3b8' : '#475569',
          fontSize: 11,
          interval: 0,
        },
      },
      yAxis: {
        type: 'value',
        min: 0,
        minInterval: 1,
        max: maxVal <= 4 ? 4 : undefined,
        splitLine: {
          lineStyle: {
            color: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.06)',
            type: 'dashed',
          },
        },
        axisLabel: {
          color: isDark ? '#64748b' : '#94a3b8',
          fontSize: 11,
        },
      },
      series: [
        {
          name: 'Ideas',
          type: 'bar',
          data: stageValues,
          barWidth: 42,
          itemStyle: {
            color: '#38bdf8',
            borderRadius: [6, 6, 0, 0],
          },
          emphasis: {
            itemStyle: {
              color: '#29c9d1',
            },
          },
        },
      ],
    };

    chart.setOption(option);

    const handleResize = () => {
      chart.resize();
    };

    window.addEventListener('resize', handleResize);
    const resizeObserver = new ResizeObserver(() => {
      chart.resize();
    });
    resizeObserver.observe(chartRef.current);

    return () => {
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
    };
  }, [data, themeMode]);

  // Clean up ECharts on unmount
  useEffect(() => {
    return () => {
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }
    };
  }, []);

  if (loading && !data) {
    return (
      <div className={styles.loadingContainer}>
        <Spin size="large" />
        <span>Loading programme overview...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={styles.loadingContainer}>
        <span>Unable to load overview data.</span>
        <button
          type="button"
          className={styles.refreshBtn}
          onClick={() => loadData(false)}
        >
          <RotateCw size={14} />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  const { kpis, categories, companies, deadlines, activities } = data;
  const maxCategoryCount = Math.max(...categories.map((c) => c.count), 1);
  const maxCompanyCount = Math.max(...companies.map((c) => c.count), 1);

  return (
    <div className={styles.container}>
      {/* 1. Page Header */}
      <div className={styles.headerSection}>
        <div className={styles.headerTextGroup}>
          <span className={styles.topRoleTag}>ORGANIZER</span>
          <h1 className={styles.pageTitle}>Programme overview</h1>
        </div>

        <div className={styles.headerActions}>
          <Tooltip title="Refresh overview from live API">
            <button
              type="button"
              className={styles.refreshBtn}
              onClick={() => loadData(true)}
              disabled={refreshing}
              aria-label="Refresh overview"
            >
              <RotateCw size={13} className={refreshing ? 'animate-spin' : ''} />
              <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </Tooltip>

          <Link href="/organizer/manage-ideas" style={{ textDecoration: 'none' }}>
            <SubmitButton icon={<ArrowRight size={14} />}>
              Review ideas
            </SubmitButton>
          </Link>
        </div>
      </div>

      {/* 2. Top KPI Cards Row */}
      <div className={styles.kpiGrid}>
        {/* Submitted Ideas */}
        <Card className={styles.kpiCard} variant="borderless">
          <div className={styles.kpiTopRow}>
            <span className={styles.kpiLabel}>SUBMITTED IDEAS</span>
            <div className={styles.kpiIconCircle}>
              <Lightbulb size={16} />
            </div>
          </div>
          <div className={styles.kpiValue}>{kpis.submittedIdeas}</div>
        </Card>

        {/* Participants */}
        <Card className={styles.kpiCard} variant="borderless">
          <div className={styles.kpiTopRow}>
            <span className={styles.kpiLabel}>PARTICIPANTS</span>
            <div className={styles.kpiIconCircle}>
              <Users size={16} />
            </div>
          </div>
          <div className={styles.kpiValue}>{kpis.participants}</div>
        </Card>

        {/* Total Likes */}
        <Card className={styles.kpiCard} variant="borderless">
          <div className={styles.kpiTopRow}>
            <span className={styles.kpiLabel}>TOTAL LIKES</span>
            <div className={styles.kpiIconCircle}>
              <Heart size={16} />
            </div>
          </div>
          <div className={styles.kpiValue}>{kpis.totalLikes}</div>
        </Card>

        {/* In Screening */}
        <Card className={styles.kpiCard} variant="borderless">
          <div className={styles.kpiTopRow}>
            <span className={styles.kpiLabel}>IN SCREENING</span>
            <div className={styles.kpiIconCircle}>
              <Activity size={16} />
            </div>
          </div>
          <div className={styles.kpiValue}>{kpis.inScreening}</div>
        </Card>
      </div>

      {/* 3. Middle Section: ECharts Bar Chart + Scrollable Category Breakdown */}
      <div className={styles.middleGrid}>
        {/* Ideas by stage (ECharts) */}
        <Card className={styles.overviewCard} variant="borderless">
          <h2 className={styles.cardTitle}>Ideas by stage</h2>
          <div ref={chartRef} className={styles.chartContainer} />
        </Card>

        {/* Ideas by category (Scrollable List with Custom Scrollbar) */}
        <Card className={styles.overviewCard} variant="borderless">
          <h2 className={styles.cardTitle}>Ideas by category</h2>
          <div className={styles.scrollableCardBody}>
            {categories.map((cat) => {
              const widthPct = cat.count > 0 ? (cat.count / maxCategoryCount) * 100 : 0;
              return (
                <div key={cat.category} className={styles.categoryRow}>
                  <div className={styles.categoryHeader}>
                    <span className={styles.categoryName}>{cat.category}</span>
                    <span className={styles.categoryCount}>{cat.count}</span>
                  </div>
                  <div className={styles.progressTrack}>
                    <div
                      className={styles.progressFill}
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* 4. Bottom Row: 3 Cards (Company, Deadlines, Activity) */}
      <div className={styles.bottomGrid}>
        {/* Company participation */}
        <Card className={styles.overviewCard} variant="borderless">
          <h2 className={styles.cardTitle}>Company participation</h2>
          <div className={styles.companyList}>
            {companies.map((comp) => {
              const widthPct = maxCompanyCount > 0 ? (comp.count / maxCompanyCount) * 100 : 0;
              return (
                <div key={comp.company} className={styles.companyRow}>
                  <div className={styles.companyHeader}>
                    <span className={styles.companyName}>{comp.company}</span>
                    <span className={styles.companyCount}>{comp.count}</span>
                  </div>
                  <div className={styles.companyProgressTrack}>
                    <div
                      className={styles.companyProgressFill}
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <p className={styles.companyCaption}>
            Counts ideas with at least one team member from each company.
          </p>
        </Card>

        {/* Upcoming deadlines (Vertical Stepper) */}
        <Card className={styles.overviewCard} variant="borderless">
          <h2 className={styles.cardTitle}>Upcoming deadlines</h2>
          <div className={styles.deadlinesTimeline}>
            <div className={styles.deadlinesTimelineLine} />
            {deadlines.map((dl) => (
              <div key={dl.id} className={styles.deadlineStep}>
                <div
                  className={`${styles.deadlineNode} ${
                    dl.isUpcoming ? styles.deadlineNodeUpcoming : ''
                  }`}
                >
                  {dl.isUpcoming ? (
                    <Calendar size={18} strokeWidth={2} />
                  ) : (
                    <div className={styles.deadlineNodeCircle} />
                  )}
                </div>
                <div className={styles.deadlineTitleRow}>
                  <span className={styles.deadlineTitle}>{dl.title}</span>
                  {dl.badge && (
                    <span className={styles.deadlineBadge}>{dl.badge}</span>
                  )}
                </div>
                <span className={styles.deadlineDate}>{dl.date}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent activity (Scrollable with Custom Scrollbar) */}
        <Card className={styles.overviewCard} variant="borderless">
          <h2 className={styles.cardTitle}>Recent activity</h2>
          <div className={styles.activityScrollList}>
            {activities.length === 0 ? (
              <p className={styles.emptyActivityText}>No recent activity recorded yet.</p>
            ) : (
              activities.map((act) => (
                <div key={act.id} className={styles.activityItem}>
                  <span className={styles.activityText}>{act.text}</span>
                  <span className={styles.activityTime}>{act.timeAgo}</span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Overview;
