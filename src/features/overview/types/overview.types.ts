export interface BackendOverviewDeadline {
  id?: string;
  title?: string;
  date?: string;
  badge?: string;
  isUpcoming?: boolean;
  deadline?: string;
}

export interface BackendOverviewResponse {
  totalIdeas: number;
  submittedIdeas: number;
  participants: number;
  totalLikes: number;
  inScreening: number;
  byStatus: {
    DRAFT?: number;
    SUBMITTED?: number;
    UNDER_REVIEW?: number;
    CHANGES_REQUESTED?: number;
    APPROVED?: number;
    REJECTED?: number;
    ARCHIVED?: number;
    [key: string]: number | undefined;
  };
  byStage: {
    IDEA_SUBMISSION?: number;
    SCREENING?: number;
    PRESENTATION?: number;
    DEMO?: number;
    [key: string]: number | undefined;
  };
  byCategory: {
    INDUSTRIAL_AUTOMATION?: number;
    DIGITAL_MANUFACTURING?: number;
    DIGITAL_TWINS?: number;
    MODELLING_SIMULATION?: number;
    AR_VR?: number;
    AI_DATA_ANALYTICS?: number;
    ROBOTICS?: number;
    PRODUCT_PROCESS_INNOVATION?: number;
    QUALITY_RELIABILITY?: number;
    ENERGY_SUSTAINABILITY?: number;
    SAFETY_ERGONOMICS?: number;
    CUSTOMER_BUSINESS_SOLUTIONS?: number;
    [key: string]: number | undefined;
  };
  byCompany?: Record<string, number>;
  upcomingDeadlines?: BackendOverviewDeadline[];
}

export interface OverviewKpiStats {
  submittedIdeas: number;
  participants: number;
  totalLikes: number;
  inScreening: number;
  totalIdeas?: number;
}

export interface StageData {
  stage: string;
  stageCode?: string;
  count: number;
}

export interface CategoryData {
  category: string;
  categoryCode?: string;
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
