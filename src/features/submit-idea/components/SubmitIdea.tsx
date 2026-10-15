'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, Row, Col, Input, Select, App } from 'antd';
import { useRouter } from 'next/navigation';
import {
  Image as ImageIcon,
  Plus,
  Paperclip,
  X,
  Trash2,
  Users,
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { type RootState } from '@/redux/store';
import { SubmitButton, DarkButton } from '@/components/ui/app-button/AppButton';
import {
  PRIMARY_CATEGORIES,
  CATEGORY_CODE_MAP,
  saveIdeaDraft,
  getIdeaDraft,
  createIdea,
  submitDraftIdea,
  uploadIdeaPoster,
  uploadIdeaAttachment,
} from '../services/submitIdeaApi';
import type { AttachmentFile, TeamMember, IdeaCreateRequest } from '../types/submitIdea.types';
import styles from './SubmitIdea.module.css';

const { TextArea } = Input;

export const SubmitIdea: React.FC = () => {
  const { message } = App.useApp();
  const router = useRouter();

  const [isMounted, setIsMounted] = useState(false);

  // Current logged in user for Team Owner display
  const authState = useSelector((state: RootState) => state?.auth);
  const reduxUser = authState?.user || ((authState as any)?.id ? (authState as any) : null);
  const [localUser, setLocalUser] = useState<any>(null);

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('inventx_user');
        if (stored) setLocalUser(JSON.parse(stored));
      } catch {
        // ignore
      }
    }
  }, []);

  const activeUser = reduxUser?.name || reduxUser?.email ? reduxUser : localUser;
  const ownerName = isMounted ? (activeUser?.name || 'Aarav Mehta (Demo)') : 'Aarav Mehta (Demo)';
  const ownerCompany = isMounted ? (activeUser?.company || 'MANTIX') : 'MANTIX';

  // Form Fields
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [problemStatement, setProblemStatement] = useState('');
  const [expectedValue, setExpectedValue] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // Team Card Fields
  const [teamEntryName, setTeamEntryName] = useState('');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberDept, setNewMemberDept] = useState('MANTIX');

  // Poster & Attachments
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterUrl, setPosterUrl] = useState<string | null>(null);
  const [posterName, setPosterName] = useState<string | null>(null);

  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);
  const [attachments, setAttachments] = useState<AttachmentFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const posterInputRef = useRef<HTMLInputElement>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);

  // Load existing draft if present
  useEffect(() => {
    getIdeaDraft().then((draft) => {
      if (draft) {
        if (draft.title) setTitle(draft.title);
        if (draft.summary) setSummary(draft.summary);
        if (draft.description) setDescription(draft.description);
        if (draft.problemStatement) setProblemStatement(draft.problemStatement);
        if (draft.expectedBusinessValue) setExpectedValue(draft.expectedBusinessValue);
        if (draft.primaryCategory) setSelectedCategory(draft.primaryCategory);
        if (draft.teamName) setTeamEntryName(draft.teamName);
        if (draft.teamMembers && Array.isArray(draft.teamMembers)) {
          setTeamMembers(draft.teamMembers);
        }
        if (draft.posterUrl) {
          setPosterUrl(draft.posterUrl);
          setPosterName(draft.posterName || 'poster.png');
        }
        if (draft.attachments) setAttachments(draft.attachments);
      }
    });
  }, []);

  // Handle Poster Image Upload
  const handlePosterSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        message.error('Poster image must be smaller than 20 MB');
        return;
      }
      setPosterFile(file);
      setPosterName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        setPosterUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePoster = () => {
    setPosterFile(null);
    setPosterUrl(null);
    setPosterName(null);
    if (posterInputRef.current) {
      posterInputRef.current.value = '';
    }
  };

  // Handle Attachments Selection
  const handleAttachmentSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const selectedArr = Array.from(files);
      const newAttachmentMeta: AttachmentFile[] = selectedArr.map((f) => ({
        id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: f.name,
        size: f.size,
        type: f.type,
      }));

      setAttachmentFiles((prev) => [...prev, ...selectedArr]);
      setAttachments((prev) => [...prev, ...newAttachmentMeta]);
      message.success(`Added ${selectedArr.length} file(s)`);
    }
  };

  const handleRemoveAttachment = (id: string, name: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
    setAttachmentFiles((prev) => prev.filter((f) => f.name !== name));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Team Management (Max 4 people including owner => 3 slots left for additional members)
  const maxSlots = 3;
  const slotsLeft = Math.max(maxSlots - teamMembers.length, 0);

  const handleAddTeamMember = () => {
    if (teamMembers.length >= maxSlots) {
      message.warning('Maximum 4 members allowed including you');
      return;
    }
    if (!newMemberName.trim()) {
      message.warning('Please enter team member name');
      return;
    }
    if (!newMemberEmail.trim()) {
      message.warning('Please enter team member email');
      return;
    }
    if (!newMemberEmail.includes('@')) {
      message.warning('Please enter a valid email address');
      return;
    }

    setTeamMembers((prev) => [
      ...prev,
      {
        name: newMemberName.trim(),
        email: newMemberEmail.trim(),
        department: newMemberDept || 'MANTIX',
        roleInTeam: 'Contributor',
      },
    ]);
    setNewMemberName('');
    setNewMemberEmail('');
    message.success('Team member added');
  };

  const handleRemoveTeamMember = (index: number) => {
    setTeamMembers((prev) => prev.filter((_, i) => i !== index));
  };

  // Save as Draft
  const handleSaveDraft = async () => {
    const draft = {
      title,
      summary,
      description,
      problemStatement,
      expectedBusinessValue: expectedValue,
      primaryCategory: selectedCategory,
      teamName: teamEntryName,
      teamMembers,
      posterName: posterName || undefined,
      posterUrl: posterUrl || undefined,
      attachments,
      status: 'Draft' as const,
      createdAt: new Date().toISOString(),
    };

    const success = await saveIdeaDraft(draft);
    if (success) {
      message.info('Draft saved. You can return and complete it anytime.');
    } else {
      message.error('Failed to save draft.');
    }
  };

  // Submit Idea to Spring Boot Backend (POST /api/ideas + Poster & Attachments)
  const handleSubmit = async () => {
    if (!title.trim()) {
      message.warning('Please enter a title for your idea');
      return;
    }
    if (!description.trim()) {
      message.warning('Please provide a description');
      return;
    }
    if (!selectedCategory) {
      message.warning('Please select a primary category');
      return;
    }
    if (!teamEntryName.trim()) {
      message.warning('Please enter a team or individual entry name');
      return;
    }

    setIsSubmitting(true);
    try {
      const categoryCode =
        CATEGORY_CODE_MAP[selectedCategory] ||
        selectedCategory.toUpperCase().replace(/[^A-Z0-9]+/g, '_');

      const finalSummary =
        summary.trim() ||
        (description.trim().length > 150
          ? `${description.trim().substring(0, 147)}...`
          : description.trim());

      const finalTargetCustomer =
        problemStatement.trim() || 'All group operating entities';
      const finalBusinessImpact =
        expectedValue.trim() || 'Measurable engineering efficiency and operational impact';

      // Additional team members besides the owner (max 3 items as required by backend schema)
      const membersPayload: TeamMember[] = teamMembers.slice(0, 3).map((m) => ({
        name: m.name.trim(),
        email: m.email.trim(),
        department: m.department || 'Engineering',
        roleInTeam: m.roleInTeam || 'Contributor',
      }));

      const payload: IdeaCreateRequest = {
        title: title.trim(),
        summary: finalSummary,
        description: description.trim(),
        category: categoryCode,
        targetCustomer: finalTargetCustomer,
        businessImpact: finalBusinessImpact,
        teamMembers: membersPayload,
      };

      // 1. Post to http://localhost:8080/api/ideas (creates DRAFT idea)
      const createdIdea = await createIdea(payload);
      const ideaId = createdIdea?.id;

      if (!ideaId) {
        throw new Error('No idea ID returned by server');
      }

      // 2. Upload Poster if chosen (POST /api/ideas/{id}/poster)
      if (posterFile) {
        try {
          await uploadIdeaPoster(ideaId, posterFile);
        } catch (posterErr) {
          console.error('Failed to upload poster:', posterErr);
          message.warning('Idea created, but poster upload encountered an issue.');
        }
      }

      // 3. Upload Attachments if chosen (POST /api/ideas/{id}/attachments)
      if (attachmentFiles.length > 0) {
        for (const file of attachmentFiles) {
          try {
            await uploadIdeaAttachment(ideaId, file);
          } catch (attErr) {
            console.error(`Failed to upload attachment ${file.name}:`, attErr);
          }
        }
      }

      // 4. Note: Submit endpoint (/api/ideas/{id}/submit) omitted per requirement

      message.success('Idea created successfully!');
      setTimeout(() => {
        router.push('/browse-ideas');
      }, 800);
    } catch (err: any) {
      console.error('[SubmitIdea Error]:', err?.data || err?.response?.data || err);
      const serverMessage =
        err?.data?.message ||
        err?.data?.error ||
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        (typeof err === 'string' ? err : 'Failed to submit idea. Please check the backend connection.');
      message.error(serverMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.submitContainer}>
      {/* 1. Header Section */}
      <div className={styles.headerSection}>
        <h1 className={styles.pageTitle}>Submit an idea</h1>
        <p className={styles.pageSubtitle}>
          Combine capabilities across the group. Save a draft anytime — only submitted ideas enter screening.
        </p>
      </div>

      {/* Main 2-Column Responsive Grid */}
      <Row gutter={[20, 20]} align="top">
        {/* Left Column: Form Details, Team & Category */}
        <Col xs={24} lg={16} xl={16}>
          <div className={styles.leftColWrapper}>
            {/* Card 1: The Idea */}
            <Card className={styles.formCard} variant="borderless">
              <h2 className={styles.cardTitle}>The idea</h2>

              {/* Title Field */}
              <div className={styles.fieldGroup}>
                <label htmlFor="idea-title" className={styles.fieldLabel}>
                  Title <span className={styles.requiredStar}>*</span>
                </label>
                <Input
                  id="idea-title"
                  placeholder="e.g. Predictive maintenance for packaging lines"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={styles.textInput}
                />
              </div>

              {/* Summary / Elevator Pitch Field */}
              <div className={styles.fieldGroup}>
                <label htmlFor="idea-summary" className={styles.fieldLabel}>
                  Summary <span className={styles.optionalTag}>(1-sentence overview for gallery cards)</span>
                </label>
                <Input
                  id="idea-summary"
                  placeholder="e.g. AI-powered loop check automation for brownfield commissioning"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className={styles.textInput}
                />
              </div>

              {/* Description Field */}
              <div className={styles.fieldGroup}>
                <label htmlFor="idea-description" className={styles.fieldLabel}>
                  Description <span className={styles.requiredStar}>*</span>
                </label>
                <div className={styles.textAreaWrapper}>
                  <TextArea
                    id="idea-description"
                    placeholder="What is it, who benefits, and how would it work?"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className={styles.textAreaInput}
                  />
                  <div className={styles.charCounter}>{description.length} chars</div>
                </div>
              </div>

              {/* Problem Statement & Expected Business Value */}
              <Row gutter={[14, 14]} style={{ marginTop: 4, marginBottom: 0 }}>
                <Col xs={24} sm={12}>
                  <div className={styles.lastFieldGroup}>
                    <label htmlFor="idea-problem" className={styles.fieldLabel}>
                      Target customer / problem statement <span className={styles.optionalTag}>(optional)</span>
                    </label>
                    <TextArea
                      id="idea-problem"
                      value={problemStatement}
                      onChange={(e) => setProblemStatement(e.target.value)}
                      rows={3}
                      className={styles.textAreaInput}
                    />
                  </div>
                </Col>

                <Col xs={24} sm={12}>
                  <div className={styles.lastFieldGroup}>
                    <label htmlFor="idea-value" className={styles.fieldLabel}>
                      Expected business value <span className={styles.optionalTag}>(optional)</span>
                    </label>
                    <TextArea
                      id="idea-value"
                      value={expectedValue}
                      onChange={(e) => setExpectedValue(e.target.value)}
                      rows={3}
                      className={styles.textAreaInput}
                    />
                  </div>
                </Col>
              </Row>
            </Card>

            {/* Card 2: Team (Matches Attached Screenshot) */}
            <Card className={styles.formCard} variant="borderless">
              <div className={styles.cardTitleWithIcon}>
                <Users size={17} strokeWidth={2.2} />
                <span>Team</span>
              </div>
              <p className={styles.teamSubtitle}>
                Maximum 4 people including you. {slotsLeft} slot{slotsLeft === 1 ? '' : 's'} left.
              </p>

              {/* Team / individual entry name */}
              <div className={styles.fieldGroup}>
                <label htmlFor="team-entry-name" className={styles.fieldLabel}>
                  Team / individual entry name <span className={styles.requiredStar}>*</span>
                </label>
                <Input
                  id="team-entry-name"
                  placeholder="e.g. Loop Closers, OptiOps or individual entry"
                  value={teamEntryName}
                  onChange={(e) => setTeamEntryName(e.target.value)}
                  className={styles.textInput}
                />
              </div>

              {/* Owner Row */}
              <div className={styles.ownerRow}>
                <span className={styles.ownerInfo} suppressHydrationWarning>
                  {ownerName} · {ownerCompany}
                </span>
                <span className={styles.ownerBadge}>Owner</span>
              </div>

              {/* Added Team Members List */}
              {teamMembers.map((member, index) => (
                <div key={index} className={styles.memberRow}>
                  <div className={styles.memberInfo}>
                    <span style={{ fontWeight: 600 }}>{member.name}</span>
                    <span style={{ color: '#94a3b8' }}>·</span>
                    <span>{member.department}</span>
                    <span className={styles.memberSubText}>({member.email})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveTeamMember(index)}
                    className={styles.memberDeleteBtn}
                    title="Remove team member"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}

              {/* Add Member Row */}
              {slotsLeft > 0 && (
                <div className={styles.addMemberRow}>
                  <Row gutter={[8, 8]} align="middle">
                    <Col xs={24} sm={7}>
                      <Input
                        placeholder="Name"
                        value={newMemberName}
                        onChange={(e) => setNewMemberName(e.target.value)}
                        className={styles.textInput}
                        onPressEnter={handleAddTeamMember}
                      />
                    </Col>
                    <Col xs={24} sm={8}>
                      <Input
                        placeholder="Email"
                        value={newMemberEmail}
                        onChange={(e) => setNewMemberEmail(e.target.value)}
                        className={styles.textInput}
                        onPressEnter={handleAddTeamMember}
                      />
                    </Col>
                    <Col xs={16} sm={5}>
                      <Select
                        value={newMemberDept}
                        onChange={setNewMemberDept}
                        className={styles.companySelect}
                        popupMatchSelectWidth={false}
                        options={[
                          { label: 'MANTIX', value: 'MANTIX' },
                          { label: 'Nexsys', value: 'Nexsys' },
                          { label: 'Stability', value: 'Stability' },
                          { label: 'Engineering', value: 'Engineering' },
                          { label: 'Operations', value: 'Operations' },
                          { label: 'Innovation', value: 'Innovation' },
                        ]}
                      />
                    </Col>
                    <Col xs={8} sm={4}>
                      <button
                        type="button"
                        onClick={handleAddTeamMember}
                        className={styles.addMemberBtn}
                      >
                        <Plus size={14} />
                        <span>Add</span>
                      </button>
                    </Col>
                  </Row>
                </div>
              )}
            </Card>

            {/* Card 3: Primary Category */}
            <Card className={styles.formCard} variant="borderless">
              <h2 className={styles.cardTitle}>
                Primary category <span className={styles.requiredStar}>*</span>
              </h2>
              <p className={styles.cardSubtitle}>
                Categories are outcome-based and open to everyone across all three companies.
              </p>

              <Row gutter={[10, 10]}>
                {PRIMARY_CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory === cat.title;

                  return (
                    <Col key={cat.id} xs={24} sm={12}>
                      <div
                        className={`${styles.categoryCard} ${
                          isSelected ? styles.categoryCardSelected : ''
                        }`}
                        onClick={() => setSelectedCategory(cat.title)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            setSelectedCategory(cat.title);
                          }
                        }}
                      >
                        <div className={styles.radioIndicator}>
                          {isSelected && <div className={styles.radioDot} />}
                        </div>

                        <div className={styles.categoryContent}>
                          <div className={styles.categoryTitle}>{cat.title}</div>
                          <div className={styles.categoryDescription}>{cat.description}</div>
                        </div>
                      </div>
                    </Col>
                  );
                })}
              </Row>
            </Card>
          </div>
        </Col>

        {/* Right Column: Poster, Attachments & Action Buttons */}
        <Col xs={24} lg={8} xl={8}>
          <div className={styles.rightColWrapper}>
            {/* Card 1: Poster Upload */}
            <Card className={styles.formCard} variant="borderless">
              <h2 className={styles.cardTitle}>Poster</h2>
              <p className={styles.cardSubtitle}>PNG/JPG/GIF/WEBP, up to 20 MB.</p>

              <input
                type="file"
                ref={posterInputRef}
                accept="image/png,image/jpeg,image/gif,image/webp"
                style={{ display: 'none' }}
                onChange={handlePosterSelect}
              />

              {posterUrl ? (
                <div className={styles.posterPreviewWrapper}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={posterUrl} alt="Poster preview" className={styles.posterPreviewImg} />
                  <button
                    type="button"
                    onClick={handleRemovePoster}
                    className={styles.removePosterBtn}
                    title="Remove poster"
                  >
                    <Trash2 size={12} />
                    <span>Remove</span>
                  </button>
                </div>
              ) : (
                <div
                  className={styles.uploadDropzone}
                  onClick={() => posterInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                >
                  <ImageIcon size={24} className={styles.uploadIcon} />
                  <span className={styles.uploadText}>Choose poster image</span>
                </div>
              )}
            </Card>

            {/* Card 2: Attachments */}
            <Card className={styles.formCard} variant="borderless">
              <h2 className={styles.cardTitle}>Attachments</h2>
              <p className={styles.cardSubtitle}>PDF, DOCX, PPTX, XLSX or image (up to 20 MB, 10 per idea)</p>

              <input
                type="file"
                ref={attachmentInputRef}
                multiple
                accept=".pdf,.docx,.pptx,.xlsx,.png,.jpg,.jpeg,.webp,.gif,.zip"
                style={{ display: 'none' }}
                onChange={handleAttachmentSelect}
              />

              <button
                type="button"
                className={styles.addFilesBtn}
                onClick={() => attachmentInputRef.current?.click()}
              >
                <Plus size={14} />
                <span>Add files</span>
              </button>

              {attachments.length > 0 && (
                <div className={styles.attachmentList}>
                  {attachments.map((att) => (
                    <div key={att.id} className={styles.attachmentItem}>
                      <div className={styles.attachmentInfo} title={att.name}>
                        <Paperclip size={12} style={{ flexShrink: 0 }} />
                        <span>{att.name}</span>
                        <span style={{ color: '#64748b', fontSize: '9.5px' }}>
                          ({formatFileSize(att.size)})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachment(att.id, att.name)}
                        className={styles.attachmentRemoveBtn}
                        title="Remove file"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Card 3: Action Buttons */}
            <Card className={styles.actionCard} variant="borderless">
              <SubmitButton
                onClick={handleSubmit}
                loading={isSubmitting}
                className={styles.fullWidthBtn}
              >
                Submit idea
              </SubmitButton>

              {/* <DarkButton onClick={handleSaveDraft} className={styles.fullWidthBtn}>
                Save as draft
              </DarkButton> */}

              <p className={styles.actionDisclaimer}>
                Drafts are only visible to you. Submitted ideas are visible to all participants.
              </p>
            </Card>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default SubmitIdea;
