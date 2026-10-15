import {
  GetAPIRequest,
  PostAPIRequest,
  PutAPIRequest,
  PatchAPIRequest,
  fileUpload,
  PutfileUpload,
} from '@/api-client/apiClient';
import { IDEAS_ENDPOINT } from '@/constants/endpoints';
import {
  CategoryOption,
  IdeaSubmission,
  IdeaCreateRequest,
  IdeaCreateResponse,
} from '../types/submitIdea.types';

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

/**
 * Strict mapping to OpenAPI IdeaDto category enum:
 * INDUSTRIAL_AUTOMATION, DIGITAL_MANUFACTURING, DIGITAL_TWINS, MODELLING_SIMULATION,
 * AR_VR, AI_DATA_ANALYTICS, ROBOTICS, PRODUCT_PROCESS_INNOVATION, QUALITY_RELIABILITY,
 * ENERGY_SUSTAINABILITY, SAFETY_ERGONOMICS, CUSTOMER_BUSINESS_SOLUTIONS
 */
export const CATEGORY_CODE_MAP: Record<string, string> = {
  'Artificial Intelligence & Data Analytics': 'AI_DATA_ANALYTICS',
  'Industrial Automation & Control': 'INDUSTRIAL_AUTOMATION',
  'Digital Manufacturing & Smart Factories': 'DIGITAL_MANUFACTURING',
  'Digital Twins': 'DIGITAL_TWINS',
  'Modelling & Simulation': 'MODELLING_SIMULATION',
  'Augmented & Virtual Reality (AR/VR)': 'AR_VR',
  'Robotics & Intelligent Systems': 'ROBOTICS',
  'Product & Process Innovation': 'PRODUCT_PROCESS_INNOVATION',
  'Quality & Reliability': 'QUALITY_RELIABILITY',
  'Energy Efficiency & Sustainability': 'ENERGY_SUSTAINABILITY',
  'Safety & Ergonomics': 'SAFETY_ERGONOMICS',
  'Customer & Business Solutions': 'CUSTOMER_BUSINESS_SOLUTIONS',
};

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

/**
 * Create a DRAFT idea via POST /api/ideas
 */
export const createIdea = async (data: IdeaCreateRequest): Promise<IdeaCreateResponse> => {
  const response = await PostAPIRequest({
    url: IDEAS_ENDPOINT,
    data,
  });
  return response as IdeaCreateResponse;
};

/**
 * Transition idea from DRAFT to SUBMITTED via POST /api/ideas/{id}/submit
 */
export const submitDraftIdea = async (ideaId: string): Promise<any> => {
  return PostAPIRequest({
    url: `${IDEAS_ENDPOINT}/${ideaId}/submit`,
  });
};

/**
 * Upload poster via POST /api/ideas/{id}/poster
 */
export const uploadIdeaPoster = async (ideaId: string, file: File): Promise<any> => {
  const formData = new FormData();
  formData.append('file', file);
  return fileUpload(`${IDEAS_ENDPOINT}/${ideaId}/poster`, formData);
};

/**
 * Upload attachment via POST /api/ideas/{id}/attachments
 */
export const uploadIdeaAttachment = async (ideaId: string, file: File): Promise<any> => {
  const formData = new FormData();
  formData.append('file', file);
  return fileUpload(`${IDEAS_ENDPOINT}/${ideaId}/attachments`, formData);
};

/**
 * Fetch an idea by ID for editing (GET /api/ideas/{id})
 */
export const getIdeaById = async (id: string): Promise<any> => {
  return GetAPIRequest({ url: `${IDEAS_ENDPOINT}/${id}` });
};

/**
 * Update an existing idea via PUT /api/ideas/{id} (or PATCH fallback)
 */
export const updateIdea = async (
  ideaId: string,
  data: IdeaCreateRequest
): Promise<any> => {
  try {
    return await PutAPIRequest({
      url: `${IDEAS_ENDPOINT}/${ideaId}`,
      data,
    });
  } catch (err) {
    return await PatchAPIRequest({
      url: `${IDEAS_ENDPOINT}/${ideaId}`,
      data,
    });
  }
};

export { PutfileUpload };
