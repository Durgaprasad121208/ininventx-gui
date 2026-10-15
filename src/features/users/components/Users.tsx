'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Table, Input, Select, App, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Search } from 'lucide-react';
import Cookies from 'js-cookie';
import { useSelector } from 'react-redux';
import { type RootState } from '@/redux/store';
import { getOrganizerUsers, updateUserRole } from '../services/usersApi';
import type { UserItem, UserRole } from '../types/users.types';
import styles from './Users.module.css';

const ROLE_OPTIONS = [
  { value: 'EMPLOYEE', label: 'Employee' },
  { value: 'ORGANIZER', label: 'Organizer' },
  { value: 'ADMIN', label: 'Admin' },
];

const formatRoleLabel = (role?: string): string => {
  if (!role) return 'Employee';
  const found = ROLE_OPTIONS.find((r) => r.value === role.toUpperCase());
  if (found) return found.label;
  return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
};

export const Users: React.FC = () => {
  const { message } = App.useApp();
  const currentUser = useSelector((state: RootState) => state.auth.user);

  const [users, setUsers] = useState<UserItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [page, setPage] = useState<number>(0);
  const [size, setSize] = useState<number>(20);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const isInitialMount = useRef(true);

  // Debounce search query input by 400ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset pagination to first page when search or role filter changes
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    setPage(0);
  }, [debouncedSearch, selectedRole]);

  // Fetch organizer users from Spring Boot backend (GET /api/organizer/users)
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getOrganizerUsers({
        q: debouncedSearch.trim() || undefined,
        role: selectedRole !== 'ALL' ? selectedRole : undefined,
        page,
        size,
      });

      const currentUserId = Cookies.get('userId');
      const currentUserEmail = currentUser?.email?.toLowerCase();

      const mappedUsers: UserItem[] = (res.content || []).map((u) => {
        const isCurrent =
          Boolean(currentUserId && u.id === currentUserId) ||
          Boolean(currentUserEmail && u.email?.toLowerCase() === currentUserEmail);

        return {
          ...u,
          isCurrentUser: isCurrent,
        };
      });

      setUsers(mappedUsers);
      setTotalElements(res.totalElements);
    } catch (err: any) {
      console.error('[Users] Failed to fetch users:', err);
      message.error(err?.response?.data?.message || err?.message || 'Failed to load users from server');
      setUsers([]);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, selectedRole, page, size, currentUser, message]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRoleChange = async (userId: string, newRole: string, userName: string) => {
    try {
      await updateUserRole(userId, newRole);
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, role: newRole as UserRole } : user
        )
      );
      message.success(`Role for ${userName} updated to ${formatRoleLabel(newRole)}`);
    } catch (err: any) {
      console.error('[Users] Failed to update role:', err);
      message.error(err?.response?.data?.message || err?.message || `Failed to update role for ${userName}`);
    }
  };

  const columns: ColumnsType<UserItem> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: '28%',
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
      width: '32%',
      render: (email: string) => <span className={styles.emailCell}>{email}</span>,
    },
    {
      title: 'Company',
      dataIndex: 'company',
      key: 'company',
      width: '22%',
      render: (company: string) => {
        const comp = company || 'MANTIX';
        let dotClass = styles.companyDotMantix;
        if (comp.toLowerCase().includes('nexsys')) dotClass = styles.companyDotNexsys;
        if (comp.toLowerCase().includes('stability')) dotClass = styles.companyDotStability;

        return (
          <div className={styles.companyCell}>
            <span className={`${styles.companyDot} ${dotClass}`} />
            <span>{comp}</span>
          </div>
        );
      },
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      width: '18%',
      render: (role: UserRole, record: UserItem) => {
        const currentRole = (role || 'EMPLOYEE').toUpperCase();
        const select = (
          <Select
            value={currentRole}
            size="small"
            disabled={record.isCurrentUser}
            onChange={(val) => handleRoleChange(record.id, val, record.name)}
            className={`${styles.roleSelect} ${
              record.isCurrentUser ? styles.roleSelectDisabled : ''
            }`}
            options={ROLE_OPTIONS}
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

      {/* 2. Search & Role Filter Bar */}
      <div className={styles.filtersBar}>
        <div className={styles.searchWrapper}>
          <Input
            prefix={<Search size={15} style={{ color: '#64748b', marginRight: 6 }} />}
            placeholder="Search name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            allowClear
            className={styles.searchInput}
          />
        </div>

        <Select
          value={selectedRole}
          onChange={setSelectedRole}
          className={styles.roleFilterSelect}
          options={[
            { value: 'ALL', label: 'All Roles' },
            { value: 'EMPLOYEE', label: 'Employee' },
            { value: 'ORGANIZER', label: 'Organizer' },
            { value: 'ADMIN', label: 'Admin' },
          ]}
        />
      </div>

      {/* 3. Users Table (Department and Designation omitted per specifications) */}
      <div className={styles.tableContainer}>
        <Table<UserItem>
          columns={columns}
          dataSource={users}
          rowKey="id"
          size="small"
          loading={loading}
          pagination={{
            current: page + 1,
            pageSize: size,
            total: totalElements,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} users`,
            onChange: (newPage, newPageSize) => {
              setPage(newPage - 1);
              if (newPageSize !== size) {
                setSize(newPageSize);
                setPage(0);
              }
            },
          }}
          scroll={{ x: 'max-content' }}
          locale={{
            emptyText: (
              <div className={styles.emptyContainer}>
                {searchQuery || selectedRole !== 'ALL'
                  ? `No users found matching current filters`
                  : 'No users found'}
              </div>
            ),
          }}
        />
      </div>
    </div>
  );
};

export default Users;
