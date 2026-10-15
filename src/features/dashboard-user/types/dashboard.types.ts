export interface BackendRecentIdea {
  id: string;
  title: string;
  summary?: string;
  category?: string;
  stage?: string;
  status?: string;
  likeCount?: number;
  createdAt?: string;
  author?: string;
  authorName?: string;
  company?: string;
  team?: string;
  attachments?: number;
  attachmentsCount?: number;
  imageThumbnail?: string;
  stageBadge?: string;
}

export interface BackendAnnouncement {
  id: string;
  title: string;
  content?: string;
  publishedAt?: string;
  pinned?: boolean;
  type?: 'critical' | 'important' | 'info';
  date?: string;
}

export interface BackendDashboardResponse {
  myIdeas: number;
  myActiveIdeas: number;
  likesReceived: number;
  totalIdeas: number;
  byStage: {
    IDEA_SUBMISSION?: number;
    SCREENING?: number;
    PRESENTATION?: number;
    DEMO?: number;
    [key: string]: number | undefined;
  };
  byCategory: Record<string, number>;
  recentIdeas?: BackendRecentIdea[];
  announcements?: BackendAnnouncement[];
}

export interface UserStats {
  myIdeasCount: number;
  myActiveIdeas?: number;
  myIdeasLimit: number;
  likesReceived: number;
  ideasAcrossGroup: number;
  participants: number;
}

export interface StageIdeaCount {
  id: string;
  stageName: string;
  count: number;
  maxCount: number;
}

export interface DeadlineMilestone {
  id: string;
  title: string;
  date: string;
  countdown?: string;
  isCurrent?: boolean;
}

export interface RecentIdea {
  id: string;
  stage: string;
  stageBadge?: string;
  category: string;
  status: string;
  title: string;
  description: string;
  author: string;
  company: string;
  team: string;
  teamDotColor: string;
  date: string;
  likes: number;
  attachments?: number;
  imageThumbnail: string;
}

export interface AnnouncementItem {
  id: string;
  type: 'critical' | 'important' | 'info';
  date: string;
  title: string;
}

export interface DashboardHeroInfo {
  hackathonBadge: string;
  userName: string;
  tagline: string;
  subdescription: string;
  nextMilestone: {
    title: string;
    date: string;
    countdown: string;
  };
}

export interface DashboardData {
  hero: DashboardHeroInfo;
  stats: UserStats;
  stages: StageIdeaCount[];
  deadlines: DeadlineMilestone[];
  recentIdeas: RecentIdea[];
  announcements: AnnouncementItem[];
  byCategory?: Record<string, number>;
  rawBackendData?: BackendDashboardResponse;
}
