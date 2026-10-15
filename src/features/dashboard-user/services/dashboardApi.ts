import { GetAPIRequest } from '@/api-client/apiClient';
import { DASHBOARD_ENDPOINT } from '@/constants/endpoints';
import { DashboardData, BackendDashboardResponse } from '../types/dashboard.types';

export const initialDashboardData: DashboardData = {
  hero: {
    hackathonBadge: 'THE ENGGIS GROUP INNOVATION HACKATHON',
    userName: 'User',
    tagline: 'Bring your ideas. Build their impact.',
    subdescription: 'Turning engineering ideas into real-world, impactful solutions.',
    nextMilestone: {
      title: 'Inauguration',
      date: '16 Oct 2026',
      countdown: 'in 1d',
    },
  },
  stats: {
    myIdeasCount: 0,
    myActiveIdeas: 0,
    myIdeasLimit: 5,
    likesReceived: 0,
    ideasAcrossGroup: 0,
    participants: 0,
  },
  stages: [
    { id: 's1', stageName: 'S1 Idea Submission', count: 0, maxCount: 1 },
    { id: 's2', stageName: 'S2 Screening', count: 0, maxCount: 1 },
    { id: 's3', stageName: 'S3 Presentation', count: 0, maxCount: 1 },
    { id: 's4', stageName: 'S4 Demo', count: 0, maxCount: 1 },
  ],
  deadlines: [
    {
      id: 'd1',
      title: 'Inauguration',
      date: '16 Oct 2026',
      countdown: 'In 1 days',
      isCurrent: true,
    },
    {
      id: 'd2',
      title: 'Submission Deadline',
      date: '30 Oct 2026',
    },
    {
      id: 'd3',
      title: 'Screening & Selection',
      date: '2 Nov 2026',
    },
    {
      id: 'd4',
      title: 'Presentation Day',
      date: '10 Nov 2026',
    },
    {
      id: 'd5',
      title: 'Demo Day',
      date: '15 Dec 2026',
    },
  ],
  recentIdeas: [
    {
      id: 'idea-1',
      stage: 'S1 Idea Submission',
      stageBadge: 'DEMO',
      category: 'Customer & Business',
      status: 'Submitted',
      title: 'Remote Support Subscription Bundle',
      description: 'Packages secure remote OT support, quarterly preventative health-checks, and automated telemetry.',
      author: 'Rohan Iyer (Demo)',
      company: 'Nexsys Process Automations',
      team: 'Always On',
      teamDotColor: '#10b981',
      date: '14 Oct 2026',
      likes: 0,
      imageThumbnail: 'handshake',
    },
    {
      id: 'idea-2',
      stage: 'S1 Idea Submission',
      stageBadge: 'DEMO',
      category: 'AI & Data Analytics',
      status: 'Submitted',
      title: 'Commissioning Checklist Copilot',
      description: 'Generates loop-check and FAT checklists from I/O lists and electrical diagrams automatically using AI.',
      author: 'Dev Kulkarni (Demo)',
      company: 'Nexsys Process Automations',
      team: 'Loop Closers',
      teamDotColor: '#10b981',
      date: '13 Oct 2026',
      likes: 2,
      attachments: 1,
      imageThumbnail: 'robotics',
    },
    {
      id: 'idea-3',
      stage: 'S1 Idea Submission',
      stageBadge: 'DEMO',
      category: 'Product & Process',
      status: 'Submitted',
      title: 'Unified Group Skills Marketplace',
      description: 'An internal marketplace where engineers from all operating entities can share expertise and collaborate.',
      author: 'Meera Pillai (Demo)',
      company: 'Stability',
      team: 'OneTeam',
      teamDotColor: '#f59e0b',
      date: '13 Oct 2026',
      likes: 1,
      imageThumbnail: 'marketplace',
    },
  ],
  announcements: [
    {
      id: 'ann-1',
      type: 'critical',
      date: '13 Oct 2026',
      title: 'Idea submission closes 30 October',
    },
    {
      id: 'ann-2',
      type: 'important',
      date: '12 Oct 2026',
      title: 'Bring your ideas. Build their impact.',
    },
  ],
};

/**
 * Fetch dashboard metrics from Spring Boot backend (GET /api/dashboard).
 */
export const getDashboardData = async (): Promise<BackendDashboardResponse> => {
  const response = await GetAPIRequest({
    url: DASHBOARD_ENDPOINT,
  });
  return response as BackendDashboardResponse;
};

