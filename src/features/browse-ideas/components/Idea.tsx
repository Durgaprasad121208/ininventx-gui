'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, Row, Col, Input, Select } from 'antd';
import {
  Search,
  PlusCircle,
  Heart,
  Paperclip,
} from 'lucide-react';
import { SubmitButton } from '@/components/ui/app-button/AppButton';
import { renderIdeaThumbnail } from '@/assets/IdeaThumbnails';
import { getBrowseIdeas } from '../services/browseIdeasApi';
import type { IdeaItem, IdeaStatus } from '../types/browseIdeas.types';
import styles from './Idea.module.css';

export const Idea: React.FC = () => {
  const [ideas, setIdeas] = useState<IdeaItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCompany, setSelectedCompany] = useState<string>('all');
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');

  // Interactive like states
  const [likesMap, setLikesMap] = useState<Record<string, number>>({});
  const [hasLikedMap, setHasLikedMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    getBrowseIdeas().then((data) => {
      setIdeas(data);
      const initialLikes: Record<string, number> = {};
      const initialHasLiked: Record<string, boolean> = {};

      data.forEach((idea) => {
        initialLikes[idea.id] = idea.likes;
        initialHasLiked[idea.id] = Boolean(idea.hasLiked);
      });

      setLikesMap(initialLikes);
      setHasLikedMap(initialHasLiked);
    });
  }, []);

  const handleToggleLike = (ideaId: string) => {
    const isCurrentlyLiked = hasLikedMap[ideaId];
    setHasLikedMap((prev) => ({ ...prev, [ideaId]: !isCurrentlyLiked }));
    setLikesMap((prev) => ({
      ...prev,
      [ideaId]: (prev[ideaId] || 0) + (isCurrentlyLiked ? -1 : 1),
    }));
  };

  const getStatusClass = (status: IdeaStatus) => {
    switch (status) {
      case 'Submitted':
        return styles.statusTagSubmitted;
      case 'Draft':
        return styles.statusTagDraft;
      case 'Changes requested':
        return styles.statusTagChangesRequested;
      case 'Approved':
        return styles.statusTagApproved;
      default:
        return styles.statusTagSubmitted;
    }
  };

  // Filter and sort ideas
  const filteredIdeas = useMemo(() => {
    let result = [...ideas];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          i.author.toLowerCase().includes(q)
      );
    }

    if (selectedCategory !== 'all') {
      result = result.filter((i) => i.category === selectedCategory);
    }

    if (selectedCompany !== 'all') {
      result = result.filter((i) => i.company === selectedCompany);
    }

    if (selectedStage !== 'all') {
      result = result.filter((i) => i.stage === selectedStage);
    }

    if (sortBy === 'newest') {
      result.sort((a, b) => b.id.localeCompare(a.id));
    } else if (sortBy === 'oldest') {
      result.sort((a, b) => a.id.localeCompare(b.id));
    } else if (sortBy === 'most-liked') {
      result.sort((a, b) => (likesMap[b.id] || 0) - (likesMap[a.id] || 0));
    }

    return result;
  }, [ideas, searchQuery, selectedCategory, selectedCompany, selectedStage, sortBy, likesMap]);

  return (
    <div className={styles.browseContainer}>
      {/* 1. Header Section */}
      <div className={styles.headerSection}>
        <div className={styles.headerLeft}>
          <span className={styles.galleryBadge}>IDEA GALLERY</span>
          <h1 className={styles.pageTitle}>Browse ideas</h1>
          <p className={styles.pageSubtitle}>
            Ideas from MANTIX, Nexsys Process Automations and Stability. Like the ones you&apos;d back.
          </p>
        </div>

        <Link href="/submit-idea" style={{ textDecoration: 'none' }}>
          <SubmitButton icon={<PlusCircle size={15} strokeWidth={2.2} />}>
            Submit idea
          </SubmitButton>
        </Link>
      </div>

      {/* 2. Ant Design Responsive Filter Toolbar (No outer card container) */}
      <Row gutter={[10, 10]} align="middle" className={styles.filterRow}>
        <Col xs={24} sm={24} md={24} lg={8} xl={8}>
          <Input
            prefix={<Search size={14} className={styles.searchIcon} />}
            placeholder="Search title, description or owner"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            allowClear
            className={styles.searchInput}
          />
        </Col>

        <Col xs={12} sm={12} md={6} lg={4} xl={4}>
          <Select
            value={selectedCategory}
            onChange={setSelectedCategory}
            popupMatchSelectWidth={false}
            className={styles.filterSelect}
            options={[
              { label: 'All categories', value: 'all' },
              { label: 'Customer & Business', value: 'Customer & Business' },
              { label: 'AI & Data Analytics', value: 'AI & Data Analytics' },
              { label: 'Product & Process', value: 'Product & Process' },
              { label: 'Modelling & Simulation', value: 'Modelling & Simulation' },
              { label: 'Energy & Sustainability', value: 'Energy & Sustainability' },
            ]}
          />
        </Col>

        <Col xs={12} sm={12} md={6} lg={4} xl={4}>
          <Select
            value={selectedCompany}
            onChange={setSelectedCompany}
            popupMatchSelectWidth={false}
            className={styles.filterSelect}
            options={[
              { label: 'All companies', value: 'all' },
              { label: 'MANTIX', value: 'MANTIX' },
              { label: 'Stability', value: 'Stability' },
              { label: 'Nexsys', value: 'Nexsys' },
            ]}
          />
        </Col>

        <Col xs={12} sm={12} md={6} lg={4} xl={4}>
          <Select
            value={selectedStage}
            onChange={setSelectedStage}
            popupMatchSelectWidth={false}
            className={styles.filterSelect}
            options={[
              { label: 'All stages', value: 'all' },
              { label: 'S1 Idea Submission', value: 'S1 Idea Submission' },
              { label: 'S2 Screening', value: 'S2 Screening' },
              { label: 'S3 Presentation', value: 'S3 Presentation' },
              { label: 'S4 Demo', value: 'S4 Demo' },
            ]}
          />
        </Col>

        <Col xs={12} sm={12} md={6} lg={4} xl={4}>
          <Select
            value={sortBy}
            onChange={setSortBy}
            popupMatchSelectWidth={false}
            className={styles.filterSelect}
            options={[
              { label: 'Newest', value: 'newest' },
              { label: 'Oldest', value: 'oldest' },
              { label: 'Most liked', value: 'most-liked' },
            ]}
          />
        </Col>
      </Row>

      {/* 3. Ant Design Ideas Card Grid */}
      <div className={styles.ideasGrid}>
        {filteredIdeas.length === 0 ? (
          <div className={styles.emptyState}>No ideas found matching your filter criteria.</div>
        ) : (
          <Row gutter={[16, 16]}>
            {filteredIdeas.map((idea) => {
              const isLiked = hasLikedMap[idea.id];
              const likesCount = likesMap[idea.id] ?? idea.likes;

              return (
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

                    {/* Card Body */}
                    <div className={styles.cardContent}>
                      {/* Tags row */}
                      <div className={styles.tagsRow}>
                        <span className={styles.categoryTag}>{idea.category}</span>
                        <span className={getStatusClass(idea.status)}>{idea.status}</span>
                      </div>

                      {/* Title & Description */}
                      <h3 className={styles.cardTitle}>{idea.title}</h3>
                      <p className={styles.cardDescription}>{idea.description}</p>

                      {/* Author & Team section */}
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

                      {/* Card Footer: Date, attachments & like button */}
                      <div className={styles.cardFooter}>
                        <span>{idea.date}</span>

                        <div className={styles.footerActionsRight}>
                          {idea.attachments && (
                            <span className={styles.attachmentBadge}>
                              <Paperclip size={12} />
                              <span>{idea.attachments}</span>
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => handleToggleLike(idea.id)}
                            className={`${styles.likeBtn} ${isLiked ? styles.likeBtnActive : ''}`}
                            aria-label={`Like ${idea.title}`}
                          >
                            <Heart
                              size={13}
                              fill={isLiked ? '#ef4444' : 'none'}
                              stroke={isLiked ? '#ef4444' : 'currentColor'}
                            />
                            <span>{likesCount}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}
      </div>
    </div>
  );
};

export default Idea;
