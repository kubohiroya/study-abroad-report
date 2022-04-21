import {ActiveSpreadsheet} from './ActiveSpreadsheet';
import {LogHolderModule} from './LogHolder';
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

  getRowsByEmails(studentEmailArray: string[]) {
    return this.logRows.filter((row: any[]) => studentEmailArray.length === 0 || studentEmailArray.includes(row[Config.COLINDEX_LOGSHEET_EMAIL])).sort((a: any[], b: any[]) => {
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

  getLogHolderByEmails(emailArray: string[]) {
    const ret = {};
    this.getRowsByEmails(emailArray).forEach((row) => {
      const [timestamp, email, editResponseUrl, ayear, studyAt, reportNum,
        healthStatus, healthMemo,
        attendStatus, absentReason,
        studySelfReview, studyPhoto,
        personalLifeSelfReview, personalLifePhoto] = row;
      LogHolderModule.getLogs(ret, ayear, studyAt, reportNum, email).push({
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
