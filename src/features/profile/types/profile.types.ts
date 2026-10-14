export interface UserProfile {
  name: string;
  initials: string;
  roleBadge: string;
  email: string;
  company: string;
  department: string;
  role: string;
  avatarGradient?: string;
}

export interface ProfileIdeaItem {
  id: string;
  title: string;
  description: string;
  status: string;
  stage?: string;
  category: string;
  date: string;
}
