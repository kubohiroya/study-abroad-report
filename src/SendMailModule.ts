import {Member} from './Member';
import {MemberSheetModule} from './MemberSheetModule';
import {ScheduleSheetModule} from './ScheduleSheetModule';
import {LogSheetModule} from './LogSheetModule';
import {Config, SHEET_PREFIX} from './Config';
import {StringUtil} from './StringUtil';
import {MailTemplateSheetModule} from './MailTemplateSheetModule';
import {LogHolderModule} from './LogHolder';
import {SheetGroup} from "./SheetGroup";

export class SendMailModule {

  static sendCustomizedMailsByDate(sheetGroup: SheetGroup, date: Date) {

    let studentMap = new MemberSheetModule(sheetGroup).getMemberMap();

    const scheduleItems = new ScheduleSheetModule(sheetGroup).getItemsByDate(date);

    const logs = new LogSheetModule(sheetGroup).getLogHolderByEmails([]);
    const mailTemplateSheetModule = new MailTemplateSheetModule(sheetGroup);
    scheduleItems.forEach((item) => {
      const template = mailTemplateSheetModule.getMailTemplate(item);
      if (!template) {
        return;
      }
      const ayearStudyAt = `${item.ayear}\t${item.studyAt}`;

      const reportSubmittedStudents = LogHolderModule.getLogsMap(logs, item.ayear, item.studyAt, item.reportNum);
      const reportMissedStudents = studentMap[ayearStudyAt].filter((student: Member) => !reportSubmittedStudents || !reportSubmittedStudents[student.accountId + '@' + Config.domain]);

      if (reportMissedStudents.length == 0) {
        return;
      }

      const recipient = "";
      const bcc = reportMissedStudents.map((student: Member) => student.accountId + '@' + Config.domain).join(",");

      const options = {
        bcc,
        name: 'CUC-FGS',
        noReply: true
      };

      const labels = [
        'reportNum',
        'start',
        'end',
        'dashboardUrl'
      ];
      const values = [
        item.reportNum,
        item.start,
        item.end,
        sheetGroup.config.get("dashboardUrl")!
      ];
      const [subject, body] = StringUtil.replaceAll([template.subject, template.body], labels, values);

      if (Config.DEBUG) {
        console.log(JSON.stringify({bcc: options.bcc, subject, body}, null, " "));
        return;
      }

      MailApp.sendEmail(recipient, subject, body, options);

    });

  }
}

export function sendCustomizedMailsByDateTest() {
  const sheetGroup = new SheetGroup(SHEET_PREFIX.HEALTH_CHECK_PREFIX);
  const date = new Date(Date.parse("2022-03-18T00:01:00+0900"));
  SendMailModule.sendCustomizedMailsByDate(sheetGroup, date);
}
