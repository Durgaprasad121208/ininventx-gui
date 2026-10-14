'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Card } from 'antd';
import {
  Lightbulb,
  Users,
  Heart,
  Activity,
  Calendar,
  ArrowRight,
} from 'lucide-react';
import * as echarts from 'echarts';
import { SubmitButton } from '@/components/ui/app-button/AppButton';
import { useTheme } from '@/providers/theme/ThemeProvider';
import { getOverviewData } from '../services/overviewApi';
import type { OverviewData } from '../types/overview.types';
import styles from './Overview.module.css';

export const Overview: React.FC = () => {
  const [data, setData] = useState<OverviewData | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  const { themeMode } = useTheme();

  useEffect(() => {
    getOverviewData().then((res) => {
      setData(res);
    });
  }, []);

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
        left: '2%',
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
        max: 4,
        interval: 1,
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

  if (!data) {
    return <div className={styles.container}>Loading overview...</div>;
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
        <Link href="/browse-ideas" style={{ textDecoration: 'none' }}>
          <SubmitButton icon={<ArrowRight size={14} />}>
            Review ideas
          </SubmitButton>
        </Link>
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
              const widthPct = (comp.count / maxCompanyCount) * 100;
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
            {activities.map((act) => (
              <div key={act.id} className={styles.activityItem}>
                <span className={styles.activityText}>{act.text}</span>
                <span className={styles.activityTime}>{act.timeAgo}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Overview;
