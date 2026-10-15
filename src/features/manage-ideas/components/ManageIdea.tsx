'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Table, Input, Select, Row, Col } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Search, Paperclip } from 'lucide-react';
import { getOrganizerIdeas } from '../services/manageIdeasApi';
import type { ManageIdeaRecord, ManageIdeaStatus } from '../types/manageIdeas.types';
import styles from './ManageIdea.module.css';

const formatCategory = (category?: string): string => {
  if (!category) return 'General';
  const catMap: Record<string, string> = {
    AI_DATA_ANALYTICS: 'AI & Data Analytics',
    CUSTOMER_BUSINESS: 'Customer & Business',
    CUSTOMER_BUSINESS_SOLUTIONS: 'Customer & Business',
    PRODUCT_PROCESS: 'Product & Process',
    PRODUCT_PROCESS_INNOVATION: 'Product & Process',
    MODELLING_SIMULATION: 'Modelling & Simulation',
    ENERGY_SUSTAINABILITY: 'Energy & Sustainability',
    AR_VR: 'AR & VR',
    SMART_FACTORIES: 'Smart Factories',
    INDUSTRIAL_AUTOMATION: 'Industrial Automation',
    DIGITAL_MANUFACTURING: 'Digital Manufacturing',
    DIGITAL_TWINS: 'Digital Twins',
    ROBOTICS: 'Robotics',
    QUALITY_RELIABILITY: 'Quality & Reliability',
    SAFETY_ERGONOMICS: 'Safety & Ergonomics',
  };
  const key = category.toUpperCase();
  if (catMap[key]) return catMap[key];
  return category.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
};

const formatStage = (stage?: string): { code: string; name: string } => {
  if (!stage) return { code: 'S1', name: 'Idea Submission' };
  const upper = stage.toUpperCase();
  if (upper.includes('SUBMISSION') || upper === 'IDEA_SUBMISSION' || upper === 'S1') {
    return { code: 'S1', name: 'Idea Submission' };
  }
  if (upper.includes('SCREENING') || upper === 'S2') {
    return { code: 'S2', name: 'Screening' };
  }
  if (upper.includes('PRESENTATION') || upper === 'S3') {
    return { code: 'S3', name: 'Presentation' };
  }
  if (upper.includes('DEMO') || upper === 'S4') {
    return { code: 'S4', name: 'Demo' };
  }
  return { code: 'S1', name: stage.replace(/_/g, ' ') };
};

const formatStatus = (status?: string): ManageIdeaStatus => {
  if (!status) return 'Draft';
  const upper = status.toUpperCase();
  if (upper === 'APPROVED') return 'Approved';
  if (upper === 'DRAFT') return 'Draft';
  if (upper === 'SUBMITTED') return 'Submitted';
  if (upper === 'UNDER_REVIEW' || upper === 'UNDER REVIEW') return 'Under review';
  if (upper === 'REJECTED') return 'Rejected';
  if (upper === 'ARCHIVED') return 'Archived';
  if (upper === 'CHANGES_REQUESTED') return 'Changes requested';
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};

const getStatusBadgeClass = (status: string) => {
  const norm = status.toLowerCase();
  if (norm === 'approved') return styles.statusApproved;
  if (norm === 'draft') return styles.statusDraft;
  if (norm === 'submitted') return styles.statusSubmitted;
  if (norm.includes('review')) return styles.statusUnderReview;
  if (norm === 'rejected') return styles.statusRejected;
  if (norm === 'archived') return styles.statusArchived;
  if (norm.includes('change')) return styles.statusChangesRequested;
  return styles.statusDraft;
};

const formatDate = (isoString?: string): string => {
  if (!isoString) return '—';
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

export const ManageIdea: React.FC = () => {
  const router = useRouter();

  // Search input state and debounced value
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Filters state
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCompany, setSelectedCompany] = useState<string>('all');
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');

  // Pagination & data state
  const [page, setPage] = useState<number>(0);
  const [size, setSize] = useState<number>(10);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [ideas, setIdeas] = useState<ManageIdeaRecord[]>([]);

  const isInitialMount = useRef(true);

  // Debounce search query changes by 400ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset to first page when any filter or debounced search changes
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    setPage(0);
  }, [debouncedSearch, selectedCategory, selectedCompany, selectedStage, selectedStatus, sortBy]);

  // Fetch organizer ideas from API
  const fetchIdeas = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getOrganizerIdeas({
        q: debouncedSearch.trim() || undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        company: selectedCompany !== 'all' ? selectedCompany : undefined,
        stage: selectedStage !== 'all' ? selectedStage : undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        sort: sortBy || 'newest',
        page,
        size,
      });

      const mapped: ManageIdeaRecord[] = (res.content || []).map((item) => {
        const stageInfo = formatStage(item.stage);
        return {
          id: item.id,
          title: item.title,
          summary: item.summary,
          team: item.team || item.summary || '',
          attachmentsCount: item.attachmentsCount ?? 0,
          author: item.ownerName || '—',
          company: item.company || '',
          companyDotColor: '',
          category: formatCategory(item.category),
          stageCode: stageInfo.code,
          stageName: stageInfo.name,
          status: formatStatus(item.status),
          likes: item.likeCount ?? 0,
          likedByMe: item.likedByMe ?? false,
          createdAt: formatDate(item.createdAt),
        };
      });

      setIdeas(mapped);
      setTotalElements(res.totalElements ?? mapped.length);
    } catch (error) {
      console.error('Failed to load organizer ideas', error);
      setIdeas([]);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, selectedCategory, selectedCompany, selectedStage, selectedStatus, sortBy, page, size]);

  useEffect(() => {
    fetchIdeas();
  }, [fetchIdeas]);

  // Ant Design Table Columns
  const columns: ColumnsType<ManageIdeaRecord> = [
    {
      title: 'Idea',
      dataIndex: 'title',
      key: 'title',
      width: 280,
      render: (_, record) => (
        <div className={styles.ideaTitleCell}>
          <Link
            href={`/organizer/manage-ideas/${record.id}`}
            className={styles.ideaTitleText}
            style={{ textDecoration: 'none', color: 'inherit' }}
            onClick={(e) => e.stopPropagation()}
          >
            {record.title}
          </Link>
          {record.summary ? (
            <span className={styles.ideaTeamText}>
              {record.summary}
              {record.attachmentsCount && record.attachmentsCount > 0 ? (
                <>
                  <Paperclip size={11} style={{ marginLeft: 3, verticalAlign: 'middle' }} />
                  <span>{record.attachmentsCount}</span>
                </>
              ) : null}
            </span>
          ) : null}
        </div>
      ),
    },
    {
      title: 'Owner',
      dataIndex: 'author',
      key: 'author',
      width: 200,
      render: (_, record) => (
        <div className={styles.ownerCell}>
          <span className={styles.ownerName}>{record.author}</span>
        </div>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      width: 170,
      render: (category: string) => (
        <span className={styles.categoryBadge}>{category}</span>
      ),
    },
    {
      title: 'Stage',
      dataIndex: 'stageName',
      key: 'stageName',
      width: 150,
      render: (_, record) => (
        <span className={styles.stageBadge}>
          <span className={styles.stageCode}>{record.stageCode}</span>
          <span>{record.stageName}</span>
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: ManageIdeaStatus) => (
        <span className={`${styles.statusBadge} ${getStatusBadgeClass(status)}`}>
          {status}
        </span>
      ),
    },
    {
      title: 'Likes',
      dataIndex: 'likes',
      key: 'likes',
      width: 75,
      align: 'center',
      render: (likes: number) => <span className={styles.likesCount}>{likes}</span>,
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 110,
      render: (createdAt: string) => (
        <span className={styles.createdDate}>{createdAt}</span>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      {/* 1. Page Header */}
      <div className={styles.headerSection}>
        <span className={styles.topRoleTag}>ORGANIZER</span>
        <h1 className={styles.pageTitle}>Manage ideas</h1>
        <p className={styles.pageSubtitle}>
          Includes drafts, rejected and archived ideas. Open an idea to record review decisions.
        </p>
      </div>

      {/* 2. Standalone Filters Toolbar */}
      <div className={styles.filtersToolbar}>
        <Row gutter={[10, 10]} align="middle">
          {/* Search Input with Debounce */}
          <Col xs={24} sm={24} md={12} lg={6}>
            <Input
              prefix={<Search size={14} style={{ color: '#64748b', marginRight: 4 }} />}
              placeholder="Search ideas, authors, teams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              allowClear
              className={styles.searchInput}
            />
          </Col>

          {/* Category Filter */}
          <Col xs={12} sm={12} md={6} lg={4}>
            <Select
              className={styles.filterSelect}
              value={selectedCategory}
              onChange={setSelectedCategory}
              popupMatchSelectWidth={false}
              options={[
                { value: 'all', label: 'All categories' },
                { value: 'CUSTOMER_BUSINESS', label: 'Customer & Business' },
                { value: 'AI_DATA_ANALYTICS', label: 'AI & Data Analytics' },
                { value: 'PRODUCT_PROCESS', label: 'Product & Process' },
                { value: 'SMART_FACTORIES', label: 'Smart Factories' },
                { value: 'INDUSTRIAL_AUTOMATION', label: 'Industrial Automation' },
                { value: 'MODELLING_SIMULATION', label: 'Modelling & Simulation' },
                { value: 'ENERGY_SUSTAINABILITY', label: 'Energy & Sustainability' },
                { value: 'AR_VR', label: 'AR & VR' },
                { value: 'DIGITAL_MANUFACTURING', label: 'Digital Manufacturing' },
                { value: 'DIGITAL_TWINS', label: 'Digital Twins' },
                { value: 'ROBOTICS', label: 'Robotics' },
              ]}
            />
          </Col>

          {/* Company Filter */}
          <Col xs={12} sm={12} md={6} lg={4}>
            <Select
              className={styles.filterSelect}
              value={selectedCompany}
              onChange={setSelectedCompany}
              popupMatchSelectWidth={false}
              options={[
                { value: 'all', label: 'All companies' },
                { value: 'MANTIX', label: 'MANTIX' },
                { value: 'Nexsys Process Automations', label: 'Nexsys Process Automations' },
                { value: 'Stability', label: 'Stability' },
              ]}
            />
          </Col>

          {/* Stage Filter */}
          <Col xs={12} sm={12} md={6} lg={3}>
            <Select
              className={styles.filterSelect}
              value={selectedStage}
              onChange={setSelectedStage}
              popupMatchSelectWidth={false}
              options={[
                { value: 'all', label: 'All stages' },
                { value: 'IDEA_SUBMISSION', label: 'Idea Submission' },
                { value: 'SCREENING', label: 'Screening' },
                { value: 'PRESENTATION', label: 'Presentation' },
                { value: 'DEMO', label: 'Demo' },
              ]}
            />
          </Col>

          {/* Status Filter */}
          <Col xs={12} sm={12} md={6} lg={3}>
            <Select
              className={styles.filterSelect}
              value={selectedStatus}
              onChange={setSelectedStatus}
              popupMatchSelectWidth={false}
              options={[
                { value: 'all', label: 'All statuses' },
                { value: 'APPROVED', label: 'Approved' },
                { value: 'DRAFT', label: 'Draft' },
                { value: 'SUBMITTED', label: 'Submitted' },
                { value: 'UNDER_REVIEW', label: 'Under review' },
                { value: 'REJECTED', label: 'Rejected' },
                { value: 'ARCHIVED', label: 'Archived' },
              ]}
            />
          </Col>

          {/* Sort By Filter */}
          <Col xs={24} sm={12} md={6} lg={4}>
            <Select
              className={styles.filterSelect}
              value={sortBy}
              onChange={setSortBy}
              popupMatchSelectWidth={false}
              options={[
                { value: 'newest', label: 'Newest' },
                { value: 'oldest', label: 'Oldest' },
                { value: 'likes', label: 'Most liked' },
              ]}
            />
          </Col>
        </Row>
      </div>

      {/* 3. Ant Design Table with live data, loading spinner, and pagination */}
      <div className={styles.tableContainer}>
        <Table<ManageIdeaRecord>
          columns={columns}
          dataSource={ideas}
          rowKey="id"
          size="small"
          loading={loading}
          pagination={{
            current: page + 1,
            pageSize: size,
            total: totalElements,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} ideas`,
            onChange: (newPage, newPageSize) => {
              setPage(newPage - 1);
              if (newPageSize !== size) {
                setSize(newPageSize);
                setPage(0);
              }
            },
          }}
          scroll={{ x: 960 }}
          onRow={(record) => ({
            onClick: () => {
              router.push(`/organizer/manage-ideas/${record.id}`);
            },
            style: { cursor: 'pointer' },
          })}
        />
      </div>
    </div>
  );
};

export default ManageIdea;
