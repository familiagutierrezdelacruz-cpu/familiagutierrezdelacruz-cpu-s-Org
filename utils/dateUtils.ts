// FIX: Implemented the missing date utility functions, including `calculateAge`.

/**
 * Calculates a person's age and returns it as a formatted string.
 * For infants under 1, it returns months. Otherwise, it returns years.
 * @param dob The date of birth string in 'YYYY-MM-DD' format.
 * @returns A formatted string like "3 meses" or "5 años", or null if dob is invalid.
 */
export const calculateAge = (dob: string): string | null => {
  if (!dob) return null;
  // Add T00:00:00 to ensure date is parsed in local timezone
  const birthDate = new Date(`${dob}T00:00:00`);
  const today = new Date();

  // Handle future dates
  if (birthDate > today) return null;

  const totalMonths = (today.getFullYear() - birthDate.getFullYear()) * 12 + (today.getMonth() - birthDate.getMonth());
  
  // Adjust for the day of the month. If today's date is less than birth date, a full month hasn't passed.
  let correctedMonths = totalMonths;
  if (today.getDate() < birthDate.getDate()) {
    correctedMonths--;
  }
  
  // If age is less than a year, return months
  if (correctedMonths < 12) {
    if (correctedMonths <= 0) return "0 meses";
    if (correctedMonths === 1) return "1 mes";
    return `${correctedMonths} meses`;
  }
  
  // Otherwise, return years
  const years = Math.floor(correctedMonths / 12);
  if (years === 1) return "1 año";
  return `${years} años`;
};

/**
 * Calculates a person's age in full years.
 * @param dob The date of birth string in 'YYYY-MM-DD' format.
 * @returns The age in years as a number, or 0 if the DOB is invalid or in the future.
 */
export const getAgeInYears = (dob: string): number => {
    if (!dob) return 0;
    const birthDate = new Date(`${dob}T00:00:00`);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age < 0 ? 0 : age;
};


/**
 * Parses a 'YYYY-MM-DD' date string in the local timezone, avoiding UTC conversion issues.
 * @param dateString The date string to parse.
 * @returns A Date object representing the local date.
 */
export const parseLocalDate = (dateString: string): Date => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
};

/**
 * Calculates gestational age in weeks and days from the Last Menstrual Period (LMP).
 * @param lmp The date of the LMP in 'YYYY-MM-DD' format.
 * @returns A formatted string like "8 semanas y 2 días", or a message if the date is in the future.
 */
export const calculateGestationalAge = (lmp: string): string | null => {
  if (!lmp) return null;
  const lmpDate = parseLocalDate(lmp);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (lmpDate > today) return "Fecha de FUR no puede ser en el futuro.";

  const diffTime = Math.abs(today.getTime() - lmpDate.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  const weeks = Math.floor(diffDays / 7);
  const days = diffDays % 7;

  return `${weeks} semana(s) y ${days} día(s)`;
};

/**
 * Calculates the estimated due date (EDD) using Naegele's rule from the Last Menstrual Period (LMP).
 * @param lmp The date of the LMP in 'YYYY-MM-DD' format.
 * @returns The EDD as a string in 'YYYY-MM-DD' format.
 */
export const calculateDueDate = (lmp: string): string | null => {
  if (!lmp) return null;
  const lmpDate = parseLocalDate(lmp);
  
  // Naegele's rule: +1 year, -3 months, +7 days
  lmpDate.setFullYear(lmpDate.getFullYear() + 1);
  lmpDate.setMonth(lmpDate.getMonth() - 3);
  lmpDate.setDate(lmpDate.getDate() + 7);

  // Format to YYYY-MM-DD
  const year = lmpDate.getFullYear();
  const month = (lmpDate.getMonth() + 1).toString().padStart(2, '0');
  const day = lmpDate.getDate().toString().padStart(2, '0');

  return `${year}-${month}-${day}`;
};

/**
 * Calculates the current gestational age based on a past ultrasound.
 * @param usgDateStr The date of the ultrasound in 'YYYY-MM-DD' format.
 * @param weeksAtUsg The gestational age in weeks at the time of the ultrasound.
 * @param daysAtUsg The gestational age in days at the time of the ultrasound.
 * @returns The current gestational age as a formatted string.
 */
export const calculateCurrentSDGbyUSG = (usgDateStr: string, weeksAtUsg: number, daysAtUsg: number): string | null => {
  if (!usgDateStr || isNaN(weeksAtUsg) || isNaN(daysAtUsg)) return null;
  
  const usgDate = parseLocalDate(usgDateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (usgDate > today) return "Fecha de USG no puede ser en el futuro.";

  const totalGestationalDaysAtUsg = (weeksAtUsg * 7) + daysAtUsg;
  const daysSinceUsg = Math.floor((today.getTime() - usgDate.getTime()) / (1000 * 60 * 60 * 24));
  const currentTotalGestationalDays = totalGestationalDaysAtUsg + daysSinceUsg;
  
  const currentWeeks = Math.floor(currentTotalGestationalDays / 7);
  const currentDays = currentTotalGestationalDays % 7;
  
  return `${currentWeeks} semana(s) y ${currentDays} día(s)`;
};

/**
 * Calculates the estimated due date (EDD) based on an ultrasound.
 * @param usgDateStr The date of the ultrasound in 'YYYY-MM-DD' format.
 * @param weeksAtUsg The gestational age in weeks at the time of the ultrasound.
 * @param daysAtUsg The gestational age in days at the time of the ultrasound.
 * @returns The EDD as a string in 'YYYY-MM-DD' format.
 */
export const calculateDueDateByUSG = (usgDateStr: string, weeksAtUsg: number, daysAtUsg: number): string | null => {
  if (!usgDateStr || isNaN(weeksAtUsg) || isNaN(daysAtUsg)) return null;

  const usgDate = parseLocalDate(usgDateStr);
  const gestationalAgeInDays = (weeksAtUsg * 7) + daysAtUsg;
  
  // A standard pregnancy is 280 days. Calculate remaining days from the USG date.
  const remainingDays = 280 - gestationalAgeInDays;
  
  const dueDate = new Date(usgDate);
  dueDate.setDate(dueDate.getDate() + remainingDays);

  // Format to YYYY-MM-DD
  const year = dueDate.getFullYear();
  const month = (dueDate.getMonth() + 1).toString().padStart(2, '0');
  const day = dueDate.getDate().toString().padStart(2, '0');

  return `${year}-${month}-${day}`;
};