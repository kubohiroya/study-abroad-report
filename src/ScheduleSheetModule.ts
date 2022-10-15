import {Schedule} from './Schedule';
import {DateUtil} from './DateUtil';
import {ScheduleHolder} from './ScheduleHolder';
import {Config, SHEET_PREFIX} from './Config';
import {SheetGroup} from "./SheetGroup";
import {createPrefilledUrl} from "./FormUtil";

export class ScheduleSheetModule {
  sheetGroup: SheetGroup;
  scheduleRows: any[][];
  constructor(sheetGroup: SheetGroup) {
    if (!sheetGroup.scheduleSheet) {
      throw new Error("Not found sheet 'schedule'");
    }
    this.sheetGroup = sheetGroup;
    this.scheduleRows = sheetGroup.scheduleSheet.getDataRange().getValues().filter((row, index) => index > 0 && row[0]);
  }

  updateScheduleCellValues() {
    if (! this.sheetGroup.scheduleSheet) {
      throw new Error("Not found sheet 'schedule'");
    }
    const src = this.sheetGroup.scheduleSheet.getRange("F2:N").getValues().filter((row) => row[0] && row[0] !== '').map(row => ({
      timeZone: row[0],
      start: row[7],
      end: row[8]
    }));

    const values = [["startJST", "endJST"]] as Array<Array<Date|string>>;
    src.forEach((row)=>{
      values.push([
        DateUtil.getTimeZoneDate(row.start, row.timeZone),
        DateUtil.getTimeZoneDate(row.end, row.timeZone, true)
      ])
    });

    this.sheetGroup.scheduleSheet.getRange(1, 15, values.length, 2).setValues(values);
  }

  getItemMap(ayearStudyAtArray: Array<string>): ScheduleHolder {
    const ret: ScheduleHolder = {};
    const nowTime = new Date().getTime();
    const formResponseUrl = this.sheetGroup.config.get("formResponseUrl");

    if (!formResponseUrl || formResponseUrl === "") {
      throw new Error("invalid formResponseUrl:"+formResponseUrl);
    }

    // Logger.log("ayearStudyAtArray:"+ayearStudyAtArray.join("/"));
    this.scheduleRows.filter((row) => {
      const ayearStudyAt = row[Config.COLINDEX_SCHEDULESHEET_AYEAR] + "\t" + row[Config.COLINDEX_SCHEDULESHEET_STUDYAT];
      // Logger.log("ayearStudyAt:"+ayearStudyAt);
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
      const prefilledUrl = createPrefilledUrl(this.sheetGroup, formResponseUrl, ayear, studyAt, reportNum);
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
    const formResponseUrl = this.sheetGroup.config.get("formResponseUrl")!;

    const check = (item: {
      startedJustNow: boolean, endInOneDay: boolean,
      endedJustNow: boolean, endedOneDayAgo: boolean
    }) => this.sheetGroup.prefix === SHEET_PREFIX.REPORT_PREFIX?
        (item.startedJustNow || item.endInOneDay || item.endedJustNow || item.endedOneDayAgo)
        :
        (item.startedJustNow || item.endedJustNow || item.endedOneDayAgo);

    return this.scheduleRows.map((row) => {
      const [ayear, studyAt, itemName, startYear, endYear, timeZone,
        _reportNum, _startMM, _startDD, _endMM, _endDD,
        reportNum, start, end,
        startJST, endJST
      ] = row;
      const startTime = startJST.getTime();
      const endTime = endJST.getTime();
      const prefilledUrl = createPrefilledUrl(this.sheetGroup, formResponseUrl, ayear, studyAt, reportNum);
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
    }).filter(item=>check(item));
  }
}
