export interface OverviewKpiStats {
  submittedIdeas: number;
  participants: number;
  totalLikes: number;
  inScreening: number;
}

export interface StageData {
  stage: string;
  count: number;
}

export interface CategoryData {
  category: string;
  count: number;
}

export interface CompanyParticipation {
  company: string;
  count: number;
}

export interface DeadlineItem {
  id: string;
  title: string;
  date: string;
  badge?: string;
  isUpcoming?: boolean;
}

export interface ActivityItem {
  id: string;
  text: string;
  timeAgo: string;
}

export interface OverviewData {
  kpis: OverviewKpiStats;
  stages: StageData[];
  categories: CategoryData[];
  companies: CompanyParticipation[];
  deadlines: DeadlineItem[];
  activities: ActivityItem[];
}
