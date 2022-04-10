import {ActiveSpreadsheet} from './ActiveSpreadsheet';
import {LogHolder} from './LogHolder';
import {Log} from './Log';
import {Config} from './Config';

export class LogSheetModule {

  logRows: any[][];

  constructor() {
    const logSheet = ActiveSpreadsheet.logSheet;
    if (!logSheet) {
      throw new Error("Not found sheet 'log'");
    }
    this.logRows = logSheet.getDataRange().getValues().filter((row: any[], index: number) => index > 0 && row[0]);
  }

  getRows(emailArray: string[]) {
    return this.logRows.filter((row: any[]) => emailArray.length === 0 || emailArray.includes(row[Config.COLINDEX_LOGSHEET_EMAIL])).sort((a: any[], b: any[]) => {
      const test = [
        a[Config.COLINDEX_LOGSHEET_STUDYAT] - b[Config.COLINDEX_LOGSHEET_STUDYAT],
        a[Config.COLINDEX_LOGSHEET_REPORTNUM] - b[Config.COLINDEX_LOGSHEET_REPORTNUM],
        a[Config.COLINDEX_LOGSHEET_TIMESTAMP] - b[Config.COLINDEX_LOGSHEET_TIMESTAMP]
      ];
      for (let i = 0; i < test.length; i++) {
        if (test[i] !== 0) {
          return test[i];
        }
      }
      return 0;
    });
  }

  static getLogArrayMap(map: LogHolder<{ [email: string]: Log[] }>, ayear: string, studyAt: string, reportNum: string) {
    return map[ayear] &&
      map[ayear][studyAt] &&
      map[ayear][studyAt][reportNum] &&
      map[ayear][studyAt][reportNum];
  }

  static getLogArray(map: LogHolder<{ [email: string]: Log[] }>, ayear: string, studyAt: string, reportNum: string, email: string): Log[] {
    if (!map[ayear]) {
      map[ayear] = {};
    }
    if (!map[ayear][studyAt]) {
      map[ayear][studyAt] = {};
    }
    if (!map[ayear][studyAt][reportNum]) {
      map[ayear][studyAt][reportNum] = {};
    }
    if (!map[ayear][studyAt][reportNum][email]) {
      map[ayear][studyAt][reportNum][email] = [];
    }
    return map[ayear][studyAt][reportNum][email];
  }

  createLogHolder(emailArray: string[]) {
    const ret = {};
    this.getRows(emailArray).forEach((row) => {
      const [timestamp, email, editResponseUrl, ayear, studyAt, reportNum,
        healthStatus, healthMemo,
        attendStatus, absentReason,
        studySelfReview, studyPhoto,
        personalLifeSelfReview, personalLifePhoto] = row;
      LogSheetModule.getLogArray(ret, ayear, studyAt, reportNum, email).push({
        timestamp, email, editResponseUrl, ayear, studyAt, reportNum,
        healthStatus, healthMemo,
        attendStatus, absentReason,
        studySelfReview, studyPhoto,
        personalLifeSelfReview, personalLifePhoto
      });
    });
    return ret;
  }
}
