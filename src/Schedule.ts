export type Schedule = {
  ayear: string;
  studyAt: string;
  itemName: string;
  timeZone: string;
  reportNum: string;
  startYear: number;
  endYear: number;
  start: string;
  end: string;
  startJST: Date;
  endJST: Date;
  prefilledUrl: string;
  isNow: boolean;

  startedJustNow?: boolean;
  endInOneDay?: boolean;
  endedJustNow?: boolean;
  endedOneDayAgo?: boolean;
}
