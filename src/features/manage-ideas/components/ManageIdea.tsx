'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Table, Input, Select, Row, Col } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Search, Paperclip } from 'lucide-react';
import { getManageIdeas } from '../services/manageIdeasApi';
import type { ManageIdeaRecord, ManageIdeaStatus } from '../types/manageIdeas.types';
import styles from './ManageIdea.module.css';

export const ManageIdea: React.FC = () => {
  const router = useRouter();
  const [ideas, setIdeas] = useState<ManageIdeaRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCompany, setSelectedCompany] = useState<string>('all');
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');

  useEffect(() => {
    getManageIdeas().then((data) => {
      setIdeas(data);
    });
  }, []);

  // Filter and sort ideas
  const filteredIdeas = useMemo(() => {
    let result = [...ideas];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.author.toLowerCase().includes(q) ||
          item.team.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter((item) => item.category === selectedCategory);
    }

    // Company filter
    if (selectedCompany !== 'all') {
      result = result.filter((item) => item.company === selectedCompany);
    }

    // Stage filter
    if (selectedStage !== 'all') {
      result = result.filter((item) => item.stageName === selectedStage);
    }

    // Status filter
    if (selectedStatus !== 'all') {
      result = result.filter((item) => item.status === selectedStatus);
    }

    // Sorting
    if (sortBy === 'newest') {
      result.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    } else if (sortBy === 'oldest') {
      result.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    } else if (sortBy === 'likes') {
      result.sort((a, b) => b.likes - a.likes);
    }

    return result;
  }, [ideas, searchQuery, selectedCategory, selectedCompany, selectedStage, selectedStatus, sortBy]);

  // Status Badge Class
  const getStatusBadgeClass = (status: ManageIdeaStatus) => {
    switch (status) {
      case 'Approved':
        return styles.statusApproved;
      case 'Draft':
        return styles.statusDraft;
      case 'Submitted':
        return styles.statusSubmitted;
      case 'Under review':
        return styles.statusUnderReview;
      case 'Rejected':
        return styles.statusRejected;
      default:
        return '';
    }
  };

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
          <span className={styles.ideaTeamText}>
            {record.team}
            {record.attachmentsCount && record.attachmentsCount > 0 ? (
              <>
                <Paperclip size={11} style={{ marginLeft: 3, verticalAlign: 'middle' }} />
                <span>{record.attachmentsCount}</span>
              </>
            ) : null}
          </span>
        </div>
      ),
    },
    {
      title: 'Owner',
      dataIndex: 'author',
      key: 'author',
      width: 220,
      render: (_, record) => (
        <div className={styles.ownerCell}>
          <span className={styles.ownerName}>{record.author}</span>
          <div className={styles.ownerCompanyRow}>
            <span
              className={styles.companyDot}
              style={{ backgroundColor: record.companyDotColor }}
            />
            <span>{record.company}</span>
          </div>
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

      {/* 2. Standalone Filters Toolbar (NO background card wrapper) */}
      <div className={styles.filtersToolbar}>
        <Row gutter={[10, 10]} align="middle">
          {/* Search Input */}
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
                { value: 'Customer & Business', label: 'Customer & Business' },
                { value: 'AI & Data Analytics', label: 'AI & Data Analytics' },
                { value: 'Product & Process', label: 'Product & Process' },
                { value: 'Smart Factories', label: 'Smart Factories' },
                { value: 'Industrial Automation', label: 'Industrial Automation' },
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
                { value: 'Idea Submission', label: 'Idea Submission' },
                { value: 'Screening', label: 'Screening' },
                { value: 'Presentation', label: 'Presentation' },
                { value: 'Demo', label: 'Demo' },
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
                { value: 'Approved', label: 'Approved' },
                { value: 'Draft', label: 'Draft' },
                { value: 'Submitted', label: 'Submitted' },
                { value: 'Under review', label: 'Under review' },
                { value: 'Rejected', label: 'Rejected' },
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

      {/* 3. Ant Design Table (size="small", No card wrapper) */}
      <div className={styles.tableContainer}>
        <Table<ManageIdeaRecord>
          columns={columns}
          dataSource={filteredIdeas}
          rowKey="id"
          size="small"
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
            hideOnSinglePage: true,
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
