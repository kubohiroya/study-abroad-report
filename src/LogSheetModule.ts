import {ActiveSpreadsheet} from './ActiveSpreadsheet';
import {LogHolder} from './LogHolder';
import {Log} from './Log';
import {Config} from './Config';

export class LogSheetModule {

  static getRows(emailArray: string[]) {
    const logSheet = ActiveSpreadsheet.logSheet;
    if (!logSheet) {
      throw new Error("Not found sheet 'log'");
    }
    const logRows = logSheet.getDataRange().getValues().filter((row: any[], index: number) => index > 0 && row[0]);
    return logRows.filter((row: any[]) => emailArray.length === 0 || emailArray.includes(row[Config.COLINDEX_LOGSHEET_EMAIL])).sort((a: any[], b: any[]) => {
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

  /*
  static createHolder(map: LogHolder<Log[]| {[email: string]: Log}>, ayear: string, studyAt: string, reportNum: string, holder: Log[] | {[email: string]: Log}): Log[] | {[email: string]: Log}{
    if(! map[ayear]){
      map[ayear] = {};
    }
    if(! map[ayear][studyAt]){
      map[ayear][studyAt] = {};
    }
    if(! map[ayear][studyAt][reportNum]){
      map[ayear][studyAt][reportNum] = holder;
    }
    return map[ayear][studyAt][reportNum];
  }
  static createHolderAsMap(map: LogHolder<{[email: string]: Log}>, email: string, ayear: string, studyAt: string, reportNum: string): {[email: string]: Log}{
    if(! map[email]){
      map[email] = {};
    }
    if(! map[email][ayear]){
      map[email][ayear] = {};
    }
    if(! map[email][ayear][studyAt]){
      map[email][ayear][studyAt] = {};
    }
    if(! map[email][ayear][studyAt][reportNum]){
      map[email][ayear][studyAt][reportNum] = {};
    }
    return map[email][ayear][studyAt][reportNum];
  }
*/

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

  /*
  static getItemsByEmail(activeUserEmail: string){
    const ret = {};
    LogSheetModule.getRows([activeUserEmail]).forEach((row)=>{
      const [timestamp, email, editResponseUrl, ayear, studyAt, reportNum,
        healthStatus, healthMemo,
        attendStatus, absentReason,
        studySelfReview, studyPhoto,
        personalLifeSelfReview, personalLifePhoto] = row;
      LogSheetModule.createHolderAsMap(ret, email, ayear, studyAt, reportNum )[email] = {
        timestamp, email, editResponseUrl, ayear, studyAt, reportNum,
        healthStatus, healthMemo,
        attendStatus, absentReason,
        studySelfReview, studyPhoto,
        personalLifeSelfReview, personalLifePhoto
      };
    });
    return ret;
  }
*/

  static createLogHolder(emailArray: string[]) {
    const ret = {};
    LogSheetModule.getRows(emailArray).forEach((row) => {
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
