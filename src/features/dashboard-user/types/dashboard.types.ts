export interface UserStats {
  myIdeasCount: number;
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
}
