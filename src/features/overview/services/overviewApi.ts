import { OverviewData } from '../types/overview.types';

export const INITIAL_OVERVIEW_DATA: OverviewData = {
  kpis: {
    submittedIdeas: 10,
    participants: 14,
    totalLikes: 30,
    inScreening: 4,
  },
  stages: [
    { stage: 'Idea Submission', count: 3 },
    { stage: 'Screening', count: 4 },
    { stage: 'Presentation', count: 1 },
    { stage: 'Demo', count: 2 },
  ],
  categories: [
    { category: 'Industrial Automation & Control', count: 0 },
    { category: 'Digital Manufacturing & Smart Factories', count: 1 },
    { category: 'Digital Twins', count: 1 },
    { category: 'Modelling & Simulation', count: 1 },
    { category: 'Augmented & Virtual Reality (AR/VR)', count: 0 },
    { category: 'Artificial Intelligence & Data Analytics', count: 1 },
    { category: 'Robotics & Intelligent Systems', count: 0 },
    { category: 'Product & Process Innovation', count: 1 },
    { category: 'Quality & Reliability', count: 1 },
    { category: 'Energy Efficiency & Sustainability', count: 2 },
    { category: 'Safety & Ergonomics', count: 1 },
    { category: 'Customer & Business Solutions', count: 1 },
  ],
  companies: [
    { company: 'MANTIX', count: 8 },
    { company: 'Nexsys Process Automations', count: 7 },
    { company: 'Stability', count: 7 },
  ],
  deadlines: [
    {
      id: 'dl-1',
      title: 'Inauguration',
      date: '16 Oct 2026',
      badge: 'In 1 days',
      isUpcoming: true,
    },
    {
      id: 'dl-2',
      title: 'Submission Deadline',
      date: '30 Oct 2026',
    },
    {
      id: 'dl-3',
      title: 'Screening & Selection',
      date: '2 Nov 2026',
    },
    {
      id: 'dl-4',
      title: 'Presentation Day',
      date: '10 Nov 2026',
    },
    {
      id: 'dl-5',
      title: 'Demo Day',
      date: '15 Dec 2026',
    },
  ],
  activities: [
    {
      id: 'act-1',
      text: 'Priya Nair (Demo) → promote on "Remote Support Subscription Bundle"',
      timeAgo: '1 minute ago',
    },
    {
      id: 'act-2',
      text: 'Priya Nair (Demo) → promote on "Remote Support Subscription Bundle"',
      timeAgo: '1 minute ago',
    },
    {
      id: 'act-3',
      text: 'Priya Nair (Demo) → promote on "Remote Support Subscription Bundle"',
      timeAgo: '1 minute ago',
    },
    {
      id: 'act-4',
      text: 'Priya Nair (Demo) promoted "Alarm Flood Rationalization Assistant" to Demo',
      timeAgo: 'about 14 hours ago',
    },
    {
      id: 'act-5',
      text: 'Rohan Iyer (Demo) submitted "Remote Support Subscription Bundle"',
      timeAgo: 'about 14 hours ago',
    },
    {
      id: 'act-6',
      text: 'Aarav Mehta submitted "Shift Handover Digital Logbook"',
      timeAgo: '1 day ago',
    },
    {
      id: 'act-7',
      text: 'Priya Nair (Demo) published announcement "Idea submission closes 30 October"',
      timeAgo: '2 days ago',
    },
  ],
};

export const getOverviewData = async (): Promise<OverviewData> => {
  return INITIAL_OVERVIEW_DATA;
};
