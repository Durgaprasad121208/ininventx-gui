export interface ProgrammeRules {
  maxIdeasPerUser: number;
  maxTeamSize: number;
}

export interface JudgingCriterion {
  id: string;
  label: string;
  weight: number;
}

export interface SettingsData {
  programmeRules: ProgrammeRules;
  judgingCriteria: JudgingCriterion[];
  apiMode: string;
}
