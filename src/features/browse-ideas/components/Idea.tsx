'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { Card, Row, Col, Input, Select, Pagination, Spin } from 'antd';
import {
  Search,
  PlusCircle,
  Heart,
  Paperclip,
} from 'lucide-react';
import { SubmitButton } from '@/components/ui/app-button/AppButton';
import { renderIdeaThumbnail } from '@/assets/IdeaThumbnails';
import { getBrowseIdeas, likeIdea, unlikeIdea } from '../services/browseIdeasApi';
import type {
  IdeaItem,
  IdeaStatus,
  BackendIdeaItem,
  IdeaThumbnailType,
} from '../types/browseIdeas.types';
import styles from './Idea.module.css';

const SVG_THUMBNAILS: IdeaThumbnailType[] = ['robotics', 'handshake', 'factory', 'leaf'];

/**
 * Returns a stable pseudo-random SVG thumbnail from the available SVG components
 */
const getRandomThumbnail = (id: string, index: number): IdeaThumbnailType => {
  if (!id) return SVG_THUMBNAILS[index % SVG_THUMBNAILS.length];
  const charSum = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), index);
  return SVG_THUMBNAILS[Math.abs(charSum) % SVG_THUMBNAILS.length];
};

/**
 * Format backend category code (e.g. AI_DATA_ANALYTICS) to display label
 */
const formatCategory = (category?: string): string => {
  if (!category) return 'General';
  const catMap: Record<string, string> = {
    AI_DATA_ANALYTICS: 'AI & Data Analytics',
    CUSTOMER_BUSINESS: 'Customer & Business',
    PRODUCT_PROCESS: 'Product & Process',
    MODELLING_SIMULATION: 'Modelling & Simulation',
    ENERGY_SUSTAINABILITY: 'Energy & Sustainability',
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
 * Format backend status code (e.g. SUBMITTED) to display label
 */
const formatStatus = (status?: string): IdeaStatus => {
  if (!status) return 'Submitted';
  const statusMap: Record<string, IdeaStatus> = {
    SUBMITTED: 'Submitted',
    DRAFT: 'Draft',
    CHANGES_REQUESTED: 'Changes requested',
    APPROVED: 'Approved',
    UNDER_REVIEW: 'Under Review',
  };
  const key = status.toUpperCase();
  if (statusMap[key]) return statusMap[key];
  return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
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
 * Get company and status dot color
 */
const getCompanyAndDot = (company?: string) => {
  const comp = company || 'Nexsys';
  let dotColor = '#10b981';
  if (comp.toLowerCase().includes('mantix')) dotColor = '#38bdf8';
  else if (comp.toLowerCase().includes('stability')) dotColor = '#f59e0b';
  return { company: comp, teamDotColor: dotColor };
};

/**
 * Map backend idea item to frontend IdeaItem structure
 */
const mapBackendIdeaToIdeaItem = (item: BackendIdeaItem, index: number): IdeaItem => {
  const { company, teamDotColor } = getCompanyAndDot(item.company);
  return {
    id: item.id,
    title: item.title,
    description: item.summary || item.description || '',
    stage: formatStage(item.stage),
    stageBadge: 'DEMO',
    category: formatCategory(item.category),
    status: formatStatus(item.status),
    author: item.ownerName || item.author || 'Anonymous',
    company,
    team: item.team || 'OneTeam',
    teamDotColor,
    date: formatDate(item.createdAt),
    likes: item.likeCount ?? item.likes ?? 0,
    hasLiked: Boolean(item.likedByMe ?? item.hasLiked),
    attachments: item.attachments,
    thumbnailType: getRandomThumbnail(item.id, index),
  };
};

export const Idea: React.FC = () => {
  const [ideas, setIdeas] = useState<IdeaItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Pagination state (Spring Boot uses 0-based page index)
  const [page, setPage] = useState<number>(0);
  const [size, setSize] = useState<number>(20);
  const [totalElements, setTotalElements] = useState<number>(0);

  // Filter toolbar state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCompany, setSelectedCompany] = useState<string>('all');
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');

  // Interactive like states
  const [likesMap, setLikesMap] = useState<Record<string, number>>({});
  const [hasLikedMap, setHasLikedMap] = useState<Record<string, boolean>>({});
  const [likeLoadingMap, setLikeLoadingMap] = useState<Record<string, boolean>>({});

  const fetchIdeas = useCallback(async (targetPage = page, targetSize = size, targetSort = sortBy) => {
    setLoading(true);
    try {
      const res = await getBrowseIdeas({
        page: targetPage,
        size: targetSize,
        sort: targetSort,
      });

      const rawItems = res.content || [];
      const mapped = rawItems.map(mapBackendIdeaToIdeaItem);

      setIdeas(mapped);
      setTotalElements(res.totalElements ?? mapped.length);

      const initialLikes: Record<string, number> = {};
      const initialHasLiked: Record<string, boolean> = {};

      mapped.forEach((idea) => {
        initialLikes[idea.id] = idea.likes;
        initialHasLiked[idea.id] = Boolean(idea.hasLiked);
      });

      setLikesMap(initialLikes);
      setHasLikedMap(initialHasLiked);
    } catch (err) {
      console.error('[Idea Component] Error fetching ideas:', err);
      setIdeas([]);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  }, [page, size, sortBy]);

  useEffect(() => {
    fetchIdeas(page, size, sortBy);
  }, [fetchIdeas, page, size, sortBy]);

  const handleToggleLike = async (ideaId: string) => {
    if (likeLoadingMap[ideaId]) return;

    const isCurrentlyLiked = Boolean(hasLikedMap[ideaId]);
    const nextLiked = !isCurrentlyLiked;
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
      console.error(`[Idea Component] Failed to toggle like for idea ${ideaId}:`, err);
      // Revert optimistic update on failure
      setHasLikedMap((prev) => ({ ...prev, [ideaId]: isCurrentlyLiked }));
      setLikesMap((prev) => ({
        ...prev,
        [ideaId]: Math.max(0, (prev[ideaId] || 0) - delta),
      }));
    } finally {
      setLikeLoadingMap((prev) => ({ ...prev, [ideaId]: false }));
    }
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

  // Filter ideas client-side for rapid interactive search/category filtering on current page
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
      result = result.filter(
        (i) => i.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (selectedCompany !== 'all') {
      result = result.filter(
        (i) => i.company.toLowerCase() === selectedCompany.toLowerCase()
      );
    }

    if (selectedStage !== 'all') {
      result = result.filter(
        (i) => i.stage.toLowerCase() === selectedStage.toLowerCase()
      );
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

      {/* 2. Ant Design Responsive Filter Toolbar */}
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
            onChange={(val) => {
              setSortBy(val);
              setPage(0);
            }}
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

      {/* 3. Ant Design Ideas Card Grid with Loader */}
      <Spin spinning={loading} size="large" classNames={{ root: styles.spinWrapper }}>
        <div className={styles.ideasGrid}>
          {!loading && filteredIdeas.length === 0 ? (
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
                              disabled={likeLoadingMap[idea.id]}
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

          {/* 4. Ant Design Pagination */}
          {totalElements > 0 && (
            <div className={styles.paginationWrapper}>
              <Pagination
                responsive
                current={page + 1}
                pageSize={size}
                total={totalElements}
                showSizeChanger
                pageSizeOptions={['10', '20', '50']}
                onChange={(newPage, newPageSize) => {
                  setPage(newPage - 1);
                  if (newPageSize !== size) {
                    setSize(newPageSize);
                    setPage(0);
                  }
                }}
                showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} ideas`}
              />
            </div>
          )}
        </div>
      </Spin>
    </div>
  );
};

export default Idea;
