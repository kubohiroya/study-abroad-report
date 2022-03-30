export class DateUtil {
  static getTimeZoneDate(yyyy_mm_dd: string, timeZone: string, endOfTheDay?: boolean) {
    if (!yyyy_mm_dd || yyyy_mm_dd === '') {
      return new Date();
    } else {
      const [yyyy, mm, dd] = yyyy_mm_dd.split('-').map((s) => parseInt(s));
      const utc = Date.UTC(yyyy, mm - 1, dd, 0, 0) + (endOfTheDay ? (1000 * (24 * 60 * 60 - 1)) : 0);
      const offsetSrc = parseInt(Utilities.formatDate(new Date(utc), timeZone, "Z"));
      const offsetMin = offsetSrc % 100;
      const offsetHour = (offsetSrc - offsetMin) / 100;
      const offset = (offsetHour * 60 + offsetMin) * 60 * 1000;
      return new Date(utc - offset);
    }
  }
}
