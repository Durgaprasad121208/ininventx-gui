'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, Tooltip, message } from 'antd';
import { Inbox, Plus, Copy, ExternalLink, Calendar, CheckCircle } from 'lucide-react';
import { SubmitButton, DarkButton } from '@/components/ui/app-button/AppButton';
import { getUserProfile } from '../services/profileApi';
import { getMyIdeas } from '@/features/my-ideas/services/myIdeasApi';
import type { UserProfile } from '../types/profile.types';
import type { MyIdeaItem } from '@/features/my-ideas/types/myIdeas.types';
import styles from './MyProfile.module.css';

export const MyProfile: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [myIdeas, setMyIdeas] = useState<MyIdeaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getUserProfile(), getMyIdeas()])
      .then(([profileData, ideasData]) => {
        setProfile(profileData);
        // By default matching the screenshot's empty state:
        // We can check if ideas exist or leave empty if user has none
        setMyIdeas(ideasData || []);
      })
      .catch((err) => {
        console.error('Failed loading profile data', err);
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

  if (!profile && !loading) {
    return <div className={styles.container}>Profile not available</div>;
  }

  const p = profile || {
    name: 'Priya Nair (Demo)',
    initials: 'PN',
    roleBadge: 'organizer',
    email: 'priya.demo@example.com',
    company: 'Nexsys Process Automations',
    department: 'Innovation Office',
    role: 'Organizer',
  };

  return (
    <div className={styles.container}>
      {/* 1. Page Header */}
      <div className={styles.headerSection}>
        <h1 className={styles.pageTitle}>Profile</h1>
        <p className={styles.pageSubtitle}>
          Profile details come from your company directory via the backend. Roles are assigned by organizers.
        </p>
      </div>

      {/* 2. Profile Details Card */}
      <Card className={styles.profileCard} variant="borderless">
        <div className={styles.profileRow}>
          {/* Avatar with Gradient */}
          <div className={styles.avatarContainer}>
            <span className={styles.avatarInitials}>{p.initials}</span>
          </div>

          {/* Details Column */}
          <div className={styles.profileDetailsCol}>
            {/* Name & Role Badge */}
            <div className={styles.nameRow}>
              <h2 className={styles.userName}>{p.name}</h2>
              <span className={styles.roleBadge}>{p.roleBadge}</span>
            </div>

            {/* 2x2 Details Grid */}
            <div className={styles.detailsGrid}>
              {/* Email */}
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Email</span>
                <span className={styles.detailValue}>
                  {p.email}{' '}
                  <Tooltip title="Copy email">
                    <button
                      type="button"
                      onClick={() => handleCopyEmail(p.email)}
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
                </span>
              </div>

              {/* Company */}
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Company</span>
                <span className={styles.detailValue}>{p.company}</span>
              </div>

              {/* Department */}
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Department</span>
                <span className={styles.detailValue}>{p.department}</span>
              </div>

              {/* Role */}
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Role</span>
                <span className={styles.detailValue}>{p.role}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* 3. Section Title: My ideas */}
      <div className={styles.sectionTitleRow}>
        <h2 className={styles.sectionTitle}>My ideas</h2>
      </div>

      {/* 4. My Ideas Card: Matching the Screenshot's Empty State */}
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
    </div>
  );
};

export default MyProfile;
