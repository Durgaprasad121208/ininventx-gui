'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, Tooltip, Spin, App } from 'antd';
import { Inbox, Plus, Copy, Heart } from 'lucide-react';
import { SubmitButton } from '@/components/ui/app-button/AppButton';
import { useSelector } from 'react-redux';
import { type RootState } from '@/redux/store';
import { getUserProfile } from '../services/profileApi';
import { getMyIdeas } from '@/features/my-ideas/services/myIdeasApi';
import type { UserProfile } from '../types/profile.types';
import type { BackendMyIdeaItem } from '@/features/my-ideas/types/myIdeas.types';
import styles from './MyProfile.module.css';

const getInitials = (name?: string): string => {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

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

const formatStatus = (status?: string): string => {
  if (!status) return 'Draft';
  const statusMap: Record<string, string> = {
    DRAFT: 'Draft',
    SUBMITTED: 'Submitted',
    CHANGES_REQUESTED: 'Changes requested',
    APPROVED: 'Approved',
    UNDER_REVIEW: 'Under review',
  };
  const key = status.toUpperCase();
  if (statusMap[key]) return statusMap[key];
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};

const formatDate = (isoString?: string): string => {
  if (!isoString) return 'Recent';
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

const formatRole = (role?: string): string => {
  if (!role) return 'Employee';
  const upper = role.toUpperCase();
  if (upper === 'ORGANISER' || upper === 'ORGANIZER') return 'Organizer';
  return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
};

export const MyProfile: React.FC = () => {
  const { message } = App.useApp();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [myIdeas, setMyIdeas] = useState<BackendMyIdeaItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  // Retrieve user details from Redux store
  const authState = useSelector((state: RootState) => state?.auth);
  const reduxUser = authState?.user || ((authState as any)?.id ? (authState as any) : null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const activeUser = isMounted
    ? (reduxUser || (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null))
    : null;

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getUserProfile().catch(() => null),
      getMyIdeas().catch(() => []),
    ])
      .then(([profileData, ideasData]) => {
        if (profileData) setProfile(profileData);
        setMyIdeas(ideasData || []);
      })
      .catch((err) => {
        console.error('Failed loading profile/ideas data', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleCopyEmail = (email: string) => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(email);
      message.success('Email copied to clipboard');
    }
  };

  const displayName = isMounted ? (activeUser?.name || profile?.name || 'User') : '';
  const displayEmail = isMounted ? (activeUser?.email || profile?.email || '') : '';
  const displayRole = isMounted ? (activeUser?.role || profile?.role || '') : '';
  const displayCompany = isMounted ? (activeUser?.company || profile?.company || 'Nexsys Process Automations') : '';
  const initials = isMounted ? getInitials(displayName) : '';

  return (
    <div className={styles.container}>
      {/* 1. Page Header */}
      <div className={styles.headerSection}>
        <h1 className={styles.pageTitle}>Profile</h1>
        <p className={styles.pageSubtitle}>
          Profile details come from your company directory via the backend. Roles are assigned by organizers.
        </p>
      </div>

      {/* 2. Profile Details Card (Department removed, using Redux details) */}
      <Card className={styles.profileCard} variant="borderless" suppressHydrationWarning>
        <div className={styles.profileRow} suppressHydrationWarning>
          {/* Avatar with Gradient */}
          <div className={styles.avatarContainer}>
            <span className={styles.avatarInitials} suppressHydrationWarning>{initials}</span>
          </div>

          {/* Details Column */}
          <div className={styles.profileDetailsCol} suppressHydrationWarning>
            {/* Name & Role Badge */}
            <div className={styles.nameRow} suppressHydrationWarning>
              <h2 className={styles.userName} suppressHydrationWarning>{displayName}</h2>
              {displayRole ? (
                <span className={styles.roleBadge} suppressHydrationWarning>{displayRole.toLowerCase()}</span>
              ) : null}
            </div>

            {/* Key-Value Details Grid: Email, Company, Role (No Department) */}
            <div className={styles.detailsGrid} suppressHydrationWarning>
              {/* Email */}
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Email</span>
                <span className={styles.detailValue} suppressHydrationWarning>
                  {displayEmail || (isMounted ? '—' : '')}
                  {displayEmail && (
                    <Tooltip title="Copy email">
                      <button
                        type="button"
                        onClick={() => handleCopyEmail(displayEmail)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#64748b',
                          cursor: 'pointer',
                          padding: 0,
                          marginLeft: 6,
                          verticalAlign: 'middle',
                        }}
                        aria-label="Copy email"
                      >
                        <Copy size={12} />
                      </button>
                    </Tooltip>
                  )}
                </span>
              </div>

              {/* Company */}
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Company</span>
                <span className={styles.detailValue} suppressHydrationWarning>
                  {displayCompany || (isMounted ? '—' : '')}
                </span>
              </div>

              {/* Role */}
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Role</span>
                <span className={styles.detailValue} suppressHydrationWarning>
                  {displayRole ? formatRole(displayRole) : (isMounted ? '—' : '')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* 3. Section Title: My ideas */}
      <div className={styles.sectionTitleRow}>
        <h2 className={styles.sectionTitle}>
          My ideas {myIdeas.length > 0 ? `(${myIdeas.length})` : ''}
        </h2>
        <Link href="/submit-idea" style={{ textDecoration: 'none' }}>
          <SubmitButton icon={<Plus size={14} />}>
            New idea
          </SubmitButton>
        </Link>
      </div>

      {/* 4. My Ideas Section (Using live /api/ideas/mine data) */}
      <Spin spinning={loading} size="large" classNames={{ root: styles.spinWrapper }}>
        {!loading && myIdeas.length === 0 ? (
          <Card className={styles.emptyCard} variant="borderless">
            <div className={styles.emptyIconCircle}>
              <Inbox size={22} strokeWidth={1.8} />
            </div>
            <div className={styles.emptyTitle}>You haven&apos;t created any ideas yet</div>
            <div className={styles.emptySubtitle}>
              Start with a draft — you can refine it before submitting.
            </div>
            <div className={styles.ctaBtnWrapper}>
              <Link href="/submit-idea" style={{ textDecoration: 'none' }}>
                <SubmitButton icon={<Plus size={14} />}>
                  Create an idea
                </SubmitButton>
              </Link>
            </div>
          </Card>
        ) : (
          <div className={styles.ideasGrid}>
            {myIdeas.map((idea) => (
              <Card key={idea.id} className={styles.ideaCard} variant="borderless">
                <div className={styles.ideaCardHeader}>
                  <span className={styles.ideaCategoryBadge}>{formatCategory(idea.category)}</span>
                  <span className={styles.ideaStatusBadge}>{formatStatus(idea.status)}</span>
                </div>
                <h3 className={styles.ideaTitle}>{idea.title}</h3>
                <p className={styles.ideaDesc}>{idea.summary || ''}</p>
                <div className={styles.ideaMetaRow}>
                  <span>{formatDate(idea.createdAt)}</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <Heart size={12} fill="#ef4444" color="#ef4444" />
                    <span>{idea.likeCount ?? 0}</span>
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Spin>
    </div>
  );
};

export default MyProfile;

