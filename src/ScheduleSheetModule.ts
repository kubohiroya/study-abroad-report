import {ActiveSpreadsheet} from './ActiveSpreadsheet';
import {Schedule} from './Schedule';
import {DateUtil} from './DateUtil';
import {ScheduleHolder} from './ScheduleHolder';
import {Config} from './Config';
import {SpreadsheetModule} from './SpreadsheetModules';

export class ScheduleSheetModule {

  scheduleRows: any[][];

  constructor() {
    if (!ActiveSpreadsheet.scheduleSheet) {
      throw new Error("Not found sheet 'schedule'");
    }
    this.scheduleRows = ActiveSpreadsheet.scheduleSheet.getDataRange().getValues().filter((row, index) => index > 0 && row[0]);
  }

  static updateScheduleCellValues() {
    if (!ActiveSpreadsheet.scheduleSheet) {
      throw new Error("Not found sheet 'schedule'");
    }
    const src = ActiveSpreadsheet.scheduleSheet.getRange("F2:N").getValues().map(row => ({
      timeZone: row[0],
      start: row[7],
      end: row[8]
    }));
    ActiveSpreadsheet.scheduleSheet.getRange("O2:O").setValues(src.map(row => [DateUtil.getTimeZoneDate(row.start, row.timeZone)]));
    ActiveSpreadsheet.scheduleSheet.getRange("P2:P").setValues(src.map(row => [DateUtil.getTimeZoneDate(row.end, row.timeZone, true)]));
    ActiveSpreadsheet.scheduleSheet.getRange("O1:P1").setValues([["startJST", "endJST"]]);
    ActiveSpreadsheet.spreadsheet.setActiveSheet(ActiveSpreadsheet.scheduleSheet);
  }

  getItemMap(ayearStudyAtArray: Array<string>): ScheduleHolder {
    const ret: ScheduleHolder = {};
    const nowTime = new Date().getTime();
    const formUrl = ActiveSpreadsheet.spreadsheet.getFormUrl();
    if (!formUrl) {
      throw new Error("invalid form");
    }

    this.scheduleRows.filter((row) => {
      const ayearStudyAt = row[Config.COLINDEX_SCHEDULESHEET_AYEAR] + "\t" + row[Config.COLINDEX_SCHEDULESHEET_STUDYAT];
      return ayearStudyAtArray.includes(ayearStudyAt);
    }).forEach(row => {
      const [ayear, studyAt, itemName, startYear, endYear, timeZone,
        _reportNum, _startMM, _startDD, _endMM, _endDD,
        reportNum, start, end,
        startJST, endJST
      ] = row;
      if (!ret[ayear]) {
        ret[ayear] = {};
      }
      if (!ret[ayear][studyAt]) {
        ret[ayear][studyAt] = [];
      }
      const startTime = startJST.getTime();
      const endTime = endJST.getTime();
      const prefilledUrl = SpreadsheetModule.createPrefilledUrl(formUrl, ayear, studyAt, reportNum);
      const isNow = startTime <= nowTime && nowTime <= endTime;
      // const isDelayed = endTime < nowTime;

      ret[ayear][studyAt].push({
        ayear, studyAt, itemName, startYear, endYear, timeZone,
        reportNum, start, end,
        startJST, endJST,
        prefilledUrl,
        isNow,
      });
    });
    return ret;
  }

  getItemsByDate(now: Date): Array<Schedule> {
    const hour = 1000 * 60 * 60;
    const nowTime = now.getTime();
    const formUrl = ActiveSpreadsheet.spreadsheet.getFormUrl();
    if (!formUrl) {
      throw new Error('invalid form');
    }
    return this.scheduleRows.map((row) => {
      const [ayear, studyAt, itemName, startYear, endYear, timeZone,
        _reportNum, _startMM, _startDD, _endMM, _endDD,
        reportNum, start, end,
        startJST, endJST
      ] = row;
      const startTime = startJST.getTime();
      const endTime = endJST.getTime();
      const prefilledUrl = SpreadsheetModule.createPrefilledUrl(formUrl, ayear, studyAt, reportNum);
      const isNow = startTime <= nowTime && nowTime <= endTime;

      const startedJustNow = startTime <= nowTime && nowTime < startTime + hour;
      const endInOneDay = endTime - 24 * hour <= nowTime && nowTime < endTime - 23 * hour;
      const endedJustNow = endTime <= nowTime && nowTime < endTime + hour;
      const endedOneDayAgo = endTime + 24 * hour <= nowTime && nowTime < endTime + 25 * hour;

      return {
        ayear, studyAt, itemName, startYear, endYear, timeZone,
        reportNum, start, end,
        startJST, endJST,
        prefilledUrl,
        isNow,
        startedJustNow,
        endInOneDay,
        endedJustNow,
        endedOneDayAgo
      };
    }).filter(item => (item.startedJustNow || item.endInOneDay || item.endedJustNow || item.endedOneDayAgo));
  }
}
