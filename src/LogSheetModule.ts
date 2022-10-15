import {LogHolderModule} from './LogHolder';
import {Config, SHEET_PREFIX} from './Config';
import {SheetGroup} from "./SheetGroup";
import {Logs} from "./Logs";
import Sheet = GoogleAppsScript.Spreadsheet.Sheet;

export class LogSheetModule {

  logSheet: Sheet;
  logRows: any[][];

  constructor(sheetGroup: SheetGroup) {
    this.logSheet = sheetGroup.logSheet;
    if (!this.logSheet) {
      throw new Error("Not found sheet 'log'");
    }
    this.logRows = this.logSheet.getDataRange().getValues().filter((row: any[], index: number) => index > 0 && row[0]);
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

  createLogEntry(row: any[]): Logs {
    if(this.logSheet.getName() === SHEET_PREFIX.HEALTH_CHECK_PREFIX+'log'){
      const [timestamp, email, editResponseUrl, ayear, studyAt, reportNum, temperature, description] = row;
      return {
        timestamp, email, editResponseUrl, ayear, studyAt, reportNum,
        temperature, description
      }
    } else if(this.logSheet.getName() === SHEET_PREFIX.REPORT_PREFIX+'log') {
      const [timestamp, email, editResponseUrl, ayear, studyAt, reportNum,
        healthStatus, healthMemo,
        attendStatus, absentReason,
        studySelfReview, researchSelfReview, studyPhoto,
        personalLifeSelfReview, personalLifePhoto] = row;
      return {
        timestamp, email, editResponseUrl, ayear, studyAt, reportNum,
        healthStatus, healthMemo,
        attendStatus, absentReason,
        studySelfReview, researchSelfReview, studyPhoto,
        personalLifeSelfReview, personalLifePhoto
      }
    }else{
      throw new Error("invalid sheet name:"+this.logSheet.getName());
    }
  }

  getLogHolderByEmails(emailArray: string[]) {
    const ret = {};
    this.getRowsByEmails(emailArray).forEach((row) => {
      const entry = this.createLogEntry(row);
      LogHolderModule.getLogs(ret, entry.ayear, entry.studyAt, entry.reportNum, entry.email).push(entry);
    });
    return ret;
  }
}
