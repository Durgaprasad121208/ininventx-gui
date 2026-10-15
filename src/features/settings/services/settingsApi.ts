import { GetAPIRequest, PutAPIRequest } from '@/api-client/apiClient';
import { SETTINGS_ENDPOINT, ORGANIZER_SETTINGS_ENDPOINT } from '@/constants/endpoints';
import type {
  SettingsData,
  ProgrammeRules,
  JudgingCriterion,
  BackendSettingsDto,
} from '../types/settings.types';

export interface CriterionDefinition {
  key: string;
  label: string;
  defaultWeight: number;
}

export const CRITERIA_DEFINITIONS: CriterionDefinition[] = [
  {
    key: 'business_value_and_customer_impact',
    label: 'Business value and customer impact',
    defaultWeight: 30,
  },
  {
    key: 'working_solution_and_demonstration',
    label: 'Working solution and demonstration',
    defaultWeight: 20,
  },
  {
    key: 'technical_feasibility_and_scalability',
    label: 'Technical feasibility and scalability',
    defaultWeight: 15,
  },
  {
    key: 'cross_company_collaboration',
    label: 'Cross-company collaboration',
    defaultWeight: 15,
  },
  {
    key: 'presentation_and_clarity',
    label: 'Presentation and clarity',
    defaultWeight: 20,
  },
];

/**
 * Converts a label or existing key to a valid backend key matching [A-Za-z][A-Za-z0-9_-]{0,39}
 */
export const toCriterionKey = (labelOrKey: string): string => {
  const match = CRITERIA_DEFINITIONS.find(
    (c) =>
      c.label.toLowerCase() === labelOrKey.toLowerCase() ||
      c.key.toLowerCase() === labelOrKey.toLowerCase()
  );
  if (match) return match.key;

  const sanitized = labelOrKey
    .trim()
    .toLowerCase()
    .replace(/[\s&/.-]+/g, '_')
    .replace(/[^a-z0-9_-]/g, '')
    .slice(0, 40);

  return /^[a-z]/i.test(sanitized) ? sanitized : `crit_${sanitized}`.slice(0, 40);
};

/**
 * Finds human-readable label for a given key or label
 */
export const toCriterionLabel = (keyOrLabel: string): string => {
  const match = CRITERIA_DEFINITIONS.find(
    (c) =>
      c.key.toLowerCase() === keyOrLabel.toLowerCase() ||
      c.label.toLowerCase() === keyOrLabel.toLowerCase()
  );
  if (match) return match.label;
  return keyOrLabel;
};

/**
 * Fetch settings from backend (GET /api/settings or /api/organizer/settings)
 */
export const getSettings = async (): Promise<SettingsData> => {
  try {
    let res: any;
    try {
      res = await GetAPIRequest({ url: SETTINGS_ENDPOINT });
    } catch {
      res = await GetAPIRequest({ url: ORGANIZER_SETTINGS_ENDPOINT });
    }

    const data: BackendSettingsDto = res?.data || res || {};

    const rules: ProgrammeRules = {
      maxIdeasPerUser: data.maxActiveIdeasPerUser ?? data.maxIdeasPerUser ?? 5,
      maxTeamSize: data.maxTeamSize ?? 4,
      maxTeamMembersBesidesOwner: data.maxTeamMembersBesidesOwner ?? 3,
      maxUploadSizeMb: data.maxUploadSizeMb ?? 20,
    };

    const rawCriteria: Record<string, any> = data.judgingCriteria || {};
    const rawKeys = Object.keys(rawCriteria);

    let judgingCriteria: JudgingCriterion[];

    if (rawKeys.length > 0) {
      // Map existing keys from backend to criteria
      judgingCriteria = rawKeys.map((key, idx) => ({
        id: `crit-${idx + 1}`,
        key: toCriterionKey(key),
        label: toCriterionLabel(key),
        weight: Number(rawCriteria[key]) || 0,
      }));
    } else {
      // Use standard default criteria list
      judgingCriteria = CRITERIA_DEFINITIONS.map((item, idx) => ({
        id: `crit-${idx + 1}`,
        key: item.key,
        label: item.label,
        weight: item.defaultWeight,
      }));
    }

    return {
      programmeRules: rules,
      judgingCriteria,
    };
  } catch (error) {
    console.warn('[settingsApi] Could not fetch settings from backend, using defaults:', error);
    return {
      programmeRules: {
        maxIdeasPerUser: 5,
        maxTeamSize: 4,
        maxTeamMembersBesidesOwner: 3,
        maxUploadSizeMb: 20,
      },
      judgingCriteria: CRITERIA_DEFINITIONS.map((item, idx) => ({
        id: `crit-${idx + 1}`,
        key: item.key,
        label: item.label,
        weight: item.defaultWeight,
      })),
    };
  }
};

/**
 * Update programme rules via PUT /api/organizer/settings
 */
export const saveProgrammeRules = async (rules: ProgrammeRules): Promise<boolean> => {
  const payload = {
    maxActiveIdeasPerUser: rules.maxIdeasPerUser,
    maxTeamSize: rules.maxTeamSize,
    maxTeamMembersBesidesOwner: rules.maxTeamMembersBesidesOwner ?? 3,
    maxUploadSizeMb: rules.maxUploadSizeMb ?? 20,
  };

  try {
    await PutAPIRequest({
      url: ORGANIZER_SETTINGS_ENDPOINT,
      data: payload,
    });
    return true;
  } catch {
    try {
      await PutAPIRequest({
        url: SETTINGS_ENDPOINT,
        data: payload,
      });
      return true;
    } catch (err) {
      console.warn('[settingsApi] Failed to save programme rules to backend:', err);
      return false;
    }
  }
};

/**
 * Update judging criteria weights via PUT /api/organizer/settings
 * Payload structure: { judgingCriteria: { [validKey]: weight } }
 * Valid key matches regex: [A-Za-z][A-Za-z0-9_-]{0,39}
 */
export const saveJudgingCriteria = async (criteria: JudgingCriterion[]): Promise<boolean> => {
  const judgingCriteriaMap: Record<string, number> = {};

  criteria.forEach((item) => {
    const key = item.key ? toCriterionKey(item.key) : toCriterionKey(item.label);
    judgingCriteriaMap[key] = Math.round(Number(item.weight) || 0);
  });

  const payload = {
    judgingCriteria: judgingCriteriaMap,
  };

  try {
    await PutAPIRequest({
      url: ORGANIZER_SETTINGS_ENDPOINT,
      data: payload,
    });
    return true;
  } catch (err) {
    try {
      await PutAPIRequest({
        url: SETTINGS_ENDPOINT,
        data: payload,
      });
      return true;
    } catch (fallbackErr) {
      console.error('[settingsApi] Failed to save judging criteria to backend:', fallbackErr);
      throw fallbackErr;
    }
  }
};
