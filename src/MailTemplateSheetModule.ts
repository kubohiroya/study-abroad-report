import {Schedule} from './Schedule';
import {Config} from './Config';
import {SheetGroup} from "./SheetGroup";

export class MailTemplateSheetModule {

  mailTemplateRows: any[][];

  constructor(sheetGroup: SheetGroup) {
    if (!sheetGroup.mailTemplateSheet) {
      throw new Error("Not found sheet 'mailTemplate'");
    }
    this.mailTemplateRows = sheetGroup.mailTemplateSheet.getDataRange().getValues()
  }

  getMailTemplateByName(templateName: string) {
    const ret = this.mailTemplateRows.filter(row => row[0] === templateName).map((row) => {
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
      throw new Error("Not found: mailTemplate: " + templateName);
    }
  }

  getMailTemplate(item: Schedule) {
    if (item.startedJustNow) {
      return this.getMailTemplateByName("startedJustNow");
    }
    if (item.endInOneDay) {
      return this.getMailTemplateByName("endInOneDay");
    }
    if (item.endedJustNow) {
      return this.getMailTemplateByName("endedJustNow");
    }
    if (item.endedOneDayAgo) {
      return this.getMailTemplateByName("endedOneDayAgo");
    }
    return null;
  }
}
