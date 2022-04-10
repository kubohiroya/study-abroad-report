import {MemberSheetModule} from './MemberSheetModule';
import {ScheduleSheetModule} from './ScheduleSheetModule';
import {LogSheetModule} from './LogSheetModule';
import {Config} from './Config';
import {Member} from './Member';
import HtmlTemplate = GoogleAppsScript.HTML.HtmlTemplate;

export function doGet(req: { parameters: any }) {
  const activeUserEmail = Session.getActiveUser().getEmail();

  const htmlTemplate = HtmlService.createTemplateFromFile("index");
  const faviconUrl = `https://drive.google.com/uc?id=${Config.faviconId}&.png`;

  const reportTemplate = HtmlService.createTemplateFromFile("reports");
  reports(activeUserEmail, req.parameters, reportTemplate);
  htmlTemplate.body = reportTemplate.evaluate().getContent();

  return htmlTemplate.evaluate().setTitle(reportTemplate.title).setFaviconUrl(faviconUrl);

}

export function include(filename: string) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function getMembers(targetUserEmail: string, studentAccountId: string | undefined): Member[] {
  const members = new MemberSheetModule();
  const student = members.getStudent(targetUserEmail);
  if (student) {
    return [student];
  }
  const isTeacher = members.isTeacher(targetUserEmail);
  if (isTeacher) {
    if (studentAccountId) {
      return getMembers(studentAccountId + "@" + Config.domain, undefined);
    } else {
      return members.getStudentArray(targetUserEmail);
    }
  } else {
    throw new Error("Invalid User: " + JSON.stringify({targetUserEmail, studentAccountId}));
  }
}

function reports(activeUserEmail: string,
                 parameters: { query?: string, student?: string },
                 bodyTemplate: HtmlTemplate): void {
  const members = getMembers(activeUserEmail, parameters.student);
  const ayearStudyAtSet = Array.from(new Set(members.map(member => member.ayear + "\t" + member.studyAt))).sort();
  const scheduleHolder = new ScheduleSheetModule().getItemMap(ayearStudyAtSet);
  const reports = LogSheetModule.createLogHolder(members.map(member => member.accountId + "@" + Config.domain));

  bodyTemplate.activeUserEmail = activeUserEmail;
  bodyTemplate.activeUserAccountId = activeUserEmail.split("@")[0];
  bodyTemplate.members = members;
  bodyTemplate.schedules = scheduleHolder;
  bodyTemplate.reports = reports;

  if (members.length == 1) {
    const user = members[0];
    if (parameters.query) {
      bodyTemplate.query = parameters.query || "all";
      bodyTemplate.title = parameters.query === 'all' ? ("提出内容一覧：" + user.displayName) : ("提出内容：" + user.displayName);
    } else {
      bodyTemplate.query = "";
      bodyTemplate.title = "提出状況一覧：" + user.displayName;
    }
  } else if (members.length > 1) {
    bodyTemplate.query = "";
    bodyTemplate.title = "担当する学生達の提出状況一覧";
  } else {
    throw new Error("no member!");
  }
}
