export interface ProgrammeRules {
  maxIdeasPerUser: number;
  maxTeamSize: number;
  maxTeamMembersBesidesOwner?: number;
  maxUploadSizeMb?: number;
}

export interface JudgingCriterion {
  id: string;
  key?: string;
  label: string;
  weight: number;
}

export interface SettingsData {
  programmeRules: ProgrammeRules;
  judgingCriteria: JudgingCriterion[];
  apiMode?: string;
}

export interface BackendSettingsDto {
  maxActiveIdeasPerUser?: number;
  maxIdeasPerUser?: number;
  maxTeamSize?: number;
  maxTeamMembersBesidesOwner?: number;
  maxUploadSizeMb?: number;
  judgingCriteria?: Record<string, number>;
}
