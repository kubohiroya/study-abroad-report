import {ActiveSpreadsheet} from './ActiveSpreadsheet';
import {Schedule} from './Schedule';
import {Config} from './Config';

export class MailTemplateSheetModule {

  mailTemplateRows: any[][];

  constructor() {
    const sheet = ActiveSpreadsheet.spreadsheet.getSheetByName("mailTemplate");
    if (!sheet) {
      throw new Error("Not found: Sheet 'mailTemplate'");
    }
    this.mailTemplateRows = sheet.getDataRange().getValues()
  }

  getMailResource(name: string) {
    const ret = this.mailTemplateRows.filter(row => row[0] === name).map((row) => {
      const [name, subject, body] = [
        row[Config.COLINDEX_MAILTEMPLATE_NAME],
        row[Config.COLINDEX_MAILTEMPLATE_SUBJECT],
        row[Config.COLINDEX_MAILTEMPLATE_BODY]
      ];
      return {
        name, subject, body
      };
    });
    if (ret.length == 1) {
      return ret[0];
    } else {
      throw new Error("Not found: mailTemplate: " + name);
    }
  }

  getMailSubjectAndBody(item: Schedule) {
    if (item.startedJustNow) {
      return this.getMailResource("startedJustNow");
    }
    if (item.endInOneDay) {
      return this.getMailResource("endInOneDay");
    }
    if (item.endedJustNow) {
      return this.getMailResource("endedJustNow");
    }
    if (item.endedOneDayAgo) {
      return this.getMailResource("endedOneDayAgo");
    }
    return null;
  }
}
