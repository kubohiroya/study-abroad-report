import {Member} from './Member';
import {MemberSheetModule} from './MemberSheetModule';
import {ScheduleSheetModule} from './ScheduleSheetModule';
import {LogSheetModule} from './LogSheetModule';
import {Config} from './Config';
import {StringUtil} from './StringUtil';
import {MailTemplateSheetModule} from './MailTemplateSheetModule';
import {LogHolderModule} from './LogHolder';

export class SendMailModule {

  static sendCustomizedMailsByDate(date: Date) {

    let studentMap = new MemberSheetModule().getMemberMap();

    const scheduleItems = new ScheduleSheetModule().getItemsByDate(date);

    const logs = new LogSheetModule().getLogHolderByEmails([]);
    const mailTemplateSheetModule = new MailTemplateSheetModule();
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
        Config.dashboardUrl
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

function sendCustomizedMailsByDateTest() {
  const date = new Date(Date.parse("2022-03-18T00:01:00+0900"));
  SendMailModule.sendCustomizedMailsByDate(date);
}
