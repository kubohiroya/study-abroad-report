import {ActiveSpreadsheet} from './ActiveSpreadsheet';
import {Schedule} from './Schedule';
import {Config} from './Config';

export class MailTemplateSheetModule {
  static _getMailResource(name: string) {
    const sheet = ActiveSpreadsheet.spreadsheet.getSheetByName("mailTemplate");
    if (!sheet) {
      throw new Error("Not found: Sheet 'mailTemplate'");
    }
    const ret = sheet.getDataRange().getValues().filter(row => row[0] === name).map((row) => {
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

  static getMailSubjectAndBody(item: Schedule) {
    if (item.startedJustNow) {
      return MailTemplateSheetModule._getMailResource("startedJustNow");
    }
    if (item.endInOneDay) {
      return MailTemplateSheetModule._getMailResource("endInOneDay");
    }
    if (item.endedJustNow) {
      return MailTemplateSheetModule._getMailResource("endedJustNow");
    }
    if (item.endedOneDayAgo) {
      return MailTemplateSheetModule._getMailResource("endedOneDayAgo");
    }
    return null;
  }
}
