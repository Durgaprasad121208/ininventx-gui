import type { SettingsData, ProgrammeRules, JudgingCriterion } from '../types/settings.types';

export const initialSettings: SettingsData = {
  programmeRules: {
    maxIdeasPerUser: 5,
    maxTeamSize: 4,
  },
  judgingCriteria: [
    {
      id: 'crit-1',
      label: 'Business value and customer impact',
      weight: 30,
    },
    {
      id: 'crit-2',
      label: 'Working solution and demonstration',
      weight: 20,
    },
    {
      id: 'crit-3',
      label: 'Technical feasibility and scalability',
      weight: 15,
    },
    {
      id: 'crit-4',
      label: 'Cross-company collaboration',
      weight: 15,
    },
    {
      id: 'crit-5',
      label: 'Presentation and clarity',
      weight: 20,
    },
  ],
  apiMode: 'demo',
};

export const getSettings = async (): Promise<SettingsData> => {
  return Promise.resolve(JSON.parse(JSON.stringify(initialSettings)));
};

export const saveProgrammeRules = async (rules: ProgrammeRules): Promise<boolean> => {
  return Promise.resolve(true);
};

export const saveJudgingCriteria = async (criteria: JudgingCriterion[]): Promise<boolean> => {
  return Promise.resolve(true);
};

export const resetDemoData = async (): Promise<boolean> => {
  return Promise.resolve(true);
};
