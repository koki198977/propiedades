/**
 * Formats a date string safely for display in the local timezone,
 * avoiding the common JS Date shift where "YYYY-MM-DD" is parsed as UTC
 * but displayed as local, resulting in the previous day in western timezones.
 * 
 * @param dateStr ISO date string or YYYY-MM-DD string
 * @param options Intl.DateTimeFormatOptions
 * @returns Formatted date string in es-CL locale by default
 */
export const formatDate = (
  dateStr: string | Date | null | undefined,
  options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'long', year: 'numeric' }
): string => {
  if (!dateStr) return 'N/A';

  let date: Date;
  
  if (typeof dateStr === 'string') {
    // If it's a simple YYYY-MM-DD string, parse it using individual components
    // to ensure it's treated as local time.
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateStr.split('-').map(Number);
      date = new Date(year, month - 1, day);
    } else {
      // If it's a full ISO string or other format
      date = new Date(dateStr);
      
      // If it's a full ISO string "2026-04-01T00:00:00.000Z", 
      // the new Date(dateStr) will be UTC midnight. 
      // For western timezones (like Chile), this shows as the previous day.
      // We check if it's exactly midnight UTC and adjust if needed, 
      // OR better, we extract the date components and treat them as local.
      
      // If the string contains 'T00:00:00', we likely want to see THAT day,
      // not the previous day due to timezone shift.
      if (dateStr.includes('T00:00:00')) {
        const [datePart] = dateStr.split('T');
        const [year, month, day] = datePart.split('-').map(Number);
        date = new Date(year, month - 1, day);
      }
    }
  } else {
    date = dateStr;
  }

  // Validate date
  if (isNaN(date.getTime())) return 'Fecha inválida';

  return date.toLocaleDateString('es-CL', options);
};

/**
 * Formats a date to YYYY-MM-DD string in LOCAL time.
 * Useful for setting default values in <input type="date">
 */
export const toLocalDateFormat = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
