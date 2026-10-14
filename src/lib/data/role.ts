export const EMPLOYEE = 'EMPLOYEE';
export const ORGANISER = 'ORGANISER';
export const ORGANIZER = 'ORGANISER'; // Alias for alternate spelling

export type Role = typeof EMPLOYEE | typeof ORGANISER;

export const ROLES = [EMPLOYEE, ORGANISER] as const;
