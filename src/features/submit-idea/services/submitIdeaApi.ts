import { CategoryOption, IdeaSubmission } from '../types/submitIdea.types';

export const PRIMARY_CATEGORIES: CategoryOption[] = [
  {
    id: 'industrial-automation-control',
    title: 'Industrial Automation & Control',
    description: 'Control systems, industrial automation and engineering workflows.',
  },
  {
    id: 'digital-manufacturing-smart-factories',
    title: 'Digital Manufacturing & Smart Factories',
    description: 'Connected production, manufacturing data and smarter factory operations.',
  },
  {
    id: 'digital-twins',
    title: 'Digital Twins',
    description: 'Digital representations of assets, processes and systems.',
  },
  {
    id: 'modelling-simulation',
    title: 'Modelling & Simulation',
    description: 'Models and simulations to test, predict and improve performance.',
  },
  {
    id: 'ar-vr',
    title: 'Augmented & Virtual Reality (AR/VR)',
    description: 'Immersive experiences for training, engineering and remote assistance.',
  },
  {
    id: 'ai-data-analytics',
    title: 'Artificial Intelligence & Data Analytics',
    description: 'Intelligent insights, predictions and decisions driven by data.',
  },
  {
    id: 'robotics-intelligent-systems',
    title: 'Robotics & Intelligent Systems',
    description: 'Robotic solutions and intelligent systems for real-world tasks.',
  },
  {
    id: 'product-process-innovation',
    title: 'Product & Process Innovation',
    description: 'New or improved products, services and ways of working.',
  },
  {
    id: 'quality-reliability',
    title: 'Quality & Reliability',
    description: 'Testing, defect prevention, dependable systems and asset health.',
  },
  {
    id: 'energy-efficiency-sustainability',
    title: 'Energy Efficiency & Sustainability',
    description: 'Efficient energy use, lower emissions and sustainable solutions.',
  },
  {
    id: 'safety-ergonomics',
    title: 'Safety & Ergonomics',
    description: 'Workplace safety, ergonomic environments and risk mitigation.',
  },
  {
    id: 'customer-business-solutions',
    title: 'Customer & Business Solutions',
    description: 'Value delivery, customer interactions and enterprise workflow solutions.',
  },
];

const STORAGE_KEY = 'inventx_submitted_ideas';
const DRAFT_KEY = 'inventx_idea_draft';

export const saveIdeaDraft = async (draft: Partial<IdeaSubmission>): Promise<boolean> => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    }
    return true;
  } catch (error) {
    console.error('Failed to save draft:', error);
    return false;
  }
};

export const getIdeaDraft = async (): Promise<Partial<IdeaSubmission> | null> => {
  try {
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem(DRAFT_KEY);
      if (data) return JSON.parse(data);
    }
  } catch (error) {
    console.error('Failed to retrieve draft:', error);
  }
  return null;
};

export const submitIdea = async (submission: IdeaSubmission): Promise<{ success: boolean; id: string }> => {
  const newId = `idea-${Date.now()}`;
  const ideaWithId = { ...submission, id: newId };

  try {
    if (typeof window !== 'undefined') {
      const existing = localStorage.getItem(STORAGE_KEY);
      const list = existing ? JSON.parse(existing) : [];
      list.unshift(ideaWithId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      // Clear draft on submission
      localStorage.removeItem(DRAFT_KEY);
    }
  } catch (error) {
    console.error('Failed to store submission:', error);
  }

  return { success: true, id: newId };
};
