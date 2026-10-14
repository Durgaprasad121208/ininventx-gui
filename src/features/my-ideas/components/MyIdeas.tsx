'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, Row, Col } from 'antd';
import { PlusCircle, Paperclip, Inbox } from 'lucide-react';
import { SubmitButton } from '@/components/ui/app-button/AppButton';
import { renderIdeaThumbnail } from '@/assets/IdeaThumbnails';
import { getMyIdeas } from '../services/myIdeasApi';
import type { MyIdeaItem, MyIdeaStatus } from '../types/myIdeas.types';
import styles from './MyIdeas.module.css';

export const MyIdeas: React.FC = () => {
  const [ideas, setIdeas] = useState<MyIdeaItem[]>([]);
  const maxAllowance = 5;

  useEffect(() => {
    getMyIdeas().then((data) => {
      setIdeas(data);
    });
  }, []);

  const getStatusClass = (status: MyIdeaStatus) => {
    switch (status) {
      case 'Under review':
        return styles.statusTagUnderReview;
      case 'Draft':
        return styles.statusTagDraft;
      case 'Submitted':
        return styles.statusTagSubmitted;
      case 'Approved':
        return styles.statusTagApproved;
      case 'Changes requested':
        return styles.statusTagChangesRequested;
      default:
        return styles.statusTagDraft;
    }
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

      {/* 3. Ideas Grid or Empty State */}
      <div className={styles.gridContainer}>
        {ideas.length === 0 ? (
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

                    {/* Card Footer: Date & Attachments */}
                    <div className={styles.cardFooter}>
                      <span>{idea.date}</span>

                      <div className={styles.footerActionsRight}>
                        {idea.attachments && (
                          <span className={styles.attachmentBadge}>
                            <Paperclip size={12} />
                            <span>{idea.attachments}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>
    </div>
  );
};

export default MyIdeas;
