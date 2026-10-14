import { AnnouncementItem } from '../types/announcements.types';

export const INITIAL_ANNOUNCEMENTS: AnnouncementItem[] = [
  {
    id: 'ann-1',
    title: 'Idea submission closes 30 October',
    content:
      'Submit your ideas by 30 October 2026. Screening & Selection: 2 November. Presentation Day: 10 November. Demo Day: 15 December. Drafts are not considered — remember to submit. (Demo announcement using poster content)',
    isPinned: true,
    priority: 'critical',
    date: '13 Oct 2026, 13:30',
    author: 'Priya Nair (Demo)',
    authorRole: 'Organiser',
    milestones: [
      { label: 'Submissions Close', date: '30 Oct' },
      { label: 'Screening & Selection', date: '2 Nov' },
      { label: 'Presentation Day', date: '10 Nov' },
      { label: 'Demo Day', date: '15 Dec' },
    ],
    actionLink: '/submit-idea',
    actionText: 'Submit idea now',
    actionType: 'primary',
  },
  {
    id: 'ann-2',
    title: 'Bring your ideas. Build their impact.',
    content:
      'Turning engineering ideas into real-world, impactful solutions. Employees can participate individually or in teams of up to 4. Inauguration: 16 October 2026. Collaborate to create customer value and measurable business impact. (Demo announcement using poster content)',
    isPinned: true,
    priority: 'important',
    date: '12 Oct 2026, 13:30',
    author: 'Priya Nair (Demo)',
    authorRole: 'Organiser',
    highlights: [
      'Teams of up to 4 or solo',
      'Inauguration: 16 Oct 2026',
      'Open to MANTIX, Nexsys & Stability',
    ],
    actionLink: '/browse-ideas',
    actionText: 'Explore gallery',
    actionType: 'secondary',
  },
  {
    id: 'ann-3',
    title: 'Workshop: Digital Twins & Simulation Architecture',
    content:
      'Join our interactive architecture masterclass on modeling plant assets and streaming telemetry into digital twins. Practical hands-on examples with guidance from senior automation specialists.',
    isPinned: false,
    priority: 'important',
    date: '10 Oct 2026, 09:15',
    author: 'Aarav Mehta',
    authorRole: 'Platform Team',
    highlights: [
      'Duration: 45 mins',
      'Hands-on architecture guide',
      'Online via Teams',
    ],
    actionLink: '/browse-ideas',
    actionText: 'View related ideas',
    actionType: 'secondary',
  },
  {
    id: 'ann-4',
    title: 'InventX 2026 Evaluation Framework Published',
    content:
      'The review panel has published the scoring rubrics: Business Impact (35%), Feasibility & Architecture (25%), Scalability across Plants (20%), and Presentation (20%). Review the official guidelines before submitting.',
    isPinned: false,
    priority: 'general',
    date: '08 Oct 2026, 11:00',
    author: 'Organiser Committee',
    authorRole: 'Advisory',
    highlights: [
      '35% Business Impact',
      '25% Technical Feasibility',
      '20% Cross-plant Scale',
    ],
    actionLink: '/guidelines',
    actionText: 'Read guidelines',
    actionType: 'secondary',
  },
];

export const getAnnouncements = async (): Promise<AnnouncementItem[]> => {
  return INITIAL_ANNOUNCEMENTS;
};
