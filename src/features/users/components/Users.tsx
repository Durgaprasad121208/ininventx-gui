'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Table, Input, Select, App, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Search } from 'lucide-react';
import { getUsers, updateUserRole } from '../services/usersApi';
import type { UserItem, UserRole } from '../types/users.types';
import styles from './Users.module.css';

export const Users: React.FC = () => {
  const { message } = App.useApp();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUsers()
      .then((data) => {
        setUsers(data);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleRoleChange = async (userId: string, newRole: UserRole, userName: string) => {
    try {
      await updateUserRole(userId, newRole);
      setUsers((prev) =>
        prev.map((user) => (user.id === userId ? { ...user, role: newRole } : user))
      );
      message.success(`Role for ${userName} updated to ${newRole}`);
    } catch {
      message.error(`Failed to update role for ${userName}`);
    }
  };

  const filteredUsers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.company.toLowerCase().includes(q) ||
        u.department.toLowerCase().includes(q)
    );
  }, [users, searchQuery]);

  const columns: ColumnsType<UserItem> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: '24%',
      render: (name: string, record: UserItem) => (
        <div className={styles.nameCell}>
          <span className={styles.userName}>{name}</span>
          {record.isCurrentUser && <span className={styles.youBadge}>You</span>}
        </div>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: '26%',
      render: (email: string) => <span className={styles.emailCell}>{email}</span>,
    },
    {
      title: 'Company',
      dataIndex: 'company',
      key: 'company',
      width: '22%',
      render: (company: string) => {
        let dotClass = styles.companyDotMantix;
        if (company.includes('Nexsys')) dotClass = styles.companyDotNexsys;
        if (company.includes('Stability')) dotClass = styles.companyDotStability;

        return (
          <div className={styles.companyCell}>
            <span className={`${styles.companyDot} ${dotClass}`} />
            <span>{company}</span>
          </div>
        );
      },
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
      width: '16%',
      render: (dept: string) => <span className={styles.departmentCell}>{dept}</span>,
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      width: '12%',
      render: (role: UserRole, record: UserItem) => {
        const select = (
          <Select
            value={role}
            size="small"
            disabled={record.isCurrentUser}
            onChange={(val) => handleRoleChange(record.id, val, record.name)}
            className={`${styles.roleSelect} ${record.isCurrentUser ? styles.roleSelectDisabled : ''}`}
            options={[
              { value: 'Employee', label: 'Employee' },
              { value: 'Organizer', label: 'Organizer' },
            ]}
          />
        );

        if (record.isCurrentUser) {
          return (
            <Tooltip title="You cannot change your own role" placement="top">
              <span>{select}</span>
            </Tooltip>
          );
        }

        return select;
      },
    },
  ];

  return (
    <div className={styles.container}>
      {/* 1. Header Section */}
      <div className={styles.headerSection}>
        <span className={styles.topRoleTag}>ORGANIZER</span>
        <h1 className={styles.pageTitle}>Users</h1>
        <p className={styles.pageSubtitle}>
          Role changes are authorized and audited by the backend. You cannot change your own role.
        </p>
      </div>

      {/* 2. Search Box */}
      <div className={styles.searchWrapper}>
        <Input
          prefix={<Search size={15} style={{ color: '#64748b', marginRight: 6 }} />}
          placeholder="Search name or email"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          allowClear
          className={styles.searchInput}
        />
      </div>

      {/* 3. Users Table (size="small", no wrap) */}
      <div className={styles.tableContainer}>
        <Table<UserItem>
          columns={columns}
          dataSource={filteredUsers}
          rowKey="id"
          size="small"
          loading={loading}
          pagination={false}
          scroll={{ x: 'max-content' }}
          locale={{
            emptyText: (
              <div className={styles.emptyContainer}>
                No users found matching &ldquo;{searchQuery}&rdquo;
              </div>
            ),
          }}
        />
      </div>
    </div>
  );
};

export default Users;
