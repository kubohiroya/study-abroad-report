import {MemberSheetModule} from './MemberSheetModule';
import {ScheduleSheetModule} from './ScheduleSheetModule';
import {LogSheetModule} from './LogSheetModule';
import {APP_MODE, Config, SHEET_PREFIX} from './Config';
import {Member} from './Member';
import {SheetGroup} from "./SheetGroup";
import HtmlTemplate = GoogleAppsScript.HTML.HtmlTemplate;

export function doGet(req: { parameters: any }) {

  const sheetGroup = new SheetGroup(getPrefix(getMode(req.parameters)));

  const activeUserEmail = Session.getActiveUser().getEmail();

  const htmlTemplate = HtmlService.createTemplateFromFile("index");
  const faviconUrl = `https://drive.google.com/uc?id=${sheetGroup.config.get("faviconId")}&.png`;
  const reportTemplate = HtmlService.createTemplateFromFile("reports");

  reports(getMode(req.parameters),
      sheetGroup, activeUserEmail, req.parameters, reportTemplate);

  htmlTemplate.body = reportTemplate.evaluate().getContent();
  return htmlTemplate.evaluate().setTitle(reportTemplate.title).setFaviconUrl(faviconUrl);
}

function getMode(parameters: any): APP_MODE {
  return (parameters.mode && parameters.mode.length === 1 && parameters.mode[0] === APP_MODE.HEALTH_CHECK_MODE) ?
      APP_MODE.HEALTH_CHECK_MODE : APP_MODE.REPORT_MODE;
}

function getPrefix(mode: APP_MODE): SHEET_PREFIX {
  return mode === APP_MODE.HEALTH_CHECK_MODE? SHEET_PREFIX.HEALTH_CHECK_PREFIX : SHEET_PREFIX.REPORT_PREFIX;
}

export function include(filename: string) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

export function getMeAsStudent(sheetGroup: SheetGroup, activeUserEmail: string): Member | null {
  return new MemberSheetModule(sheetGroup).getStudent(activeUserEmail);
}

export function getAdvisingStudents(sheetGroup: SheetGroup, activeUserEmail: string, studentAccountId: string | undefined): Member[] {
  const memberSheetModule = new MemberSheetModule(sheetGroup);
  const isTeacher = memberSheetModule.isTeacher(activeUserEmail);
  if (isTeacher) {
    if (studentAccountId) {
      const student = memberSheetModule.getStudent(studentAccountId + "@" + Config.domain);
      if (student) {
        return [student];
      } else {
        return [];
      }
    } else {
      return memberSheetModule.getAdvisingStudentArray(activeUserEmail);
    }
  } else {
    throw new Error("Invalid User: " + JSON.stringify({activeUserEmail, studentAccountId}));
  }
}

function reports(
    mode: APP_MODE,
    sheetGroup: SheetGroup,
    activeUserEmail: string,
    parameters: { mode?: string, query?: string, student?: string },
    bodyTemplate: HtmlTemplate): void {
  const me = getMeAsStudent(sheetGroup, activeUserEmail);
  const students = (me) ? [me] : getAdvisingStudents(sheetGroup, activeUserEmail, parameters.student);
  const ayearStudyAtSet = Array.from(new Set(students.map(member => member.ayear + "\t" + member.studyAt))).sort();
  const scheduleHolder = new ScheduleSheetModule(sheetGroup).getItemMap(ayearStudyAtSet);
  const reports = new LogSheetModule(sheetGroup).getLogHolderByEmails(students.map(member => member.accountId + "@" + Config.domain));

  bodyTemplate.activeUserEmail = activeUserEmail;
  bodyTemplate.activeUserAccountId = activeUserEmail.split("@")[0];
  bodyTemplate.members = students;
  bodyTemplate.schedules = scheduleHolder;
  bodyTemplate.reports = reports;
  bodyTemplate.mode = mode;

  bodyTemplate.header = mode == APP_MODE.HEALTH_CHECK_MODE ?
      `<div>
       <h2>健康観察報告</h2>
       <p>「健康観察報告」は、毎日(毎朝)、実施してください。</p>
       <p>健康に関して、何らかの心配がある場合や、対応を要する場合については、「留学生サポートデスク」等への連絡、
            担当教員へのTeamsチャットを通じての連絡をしてください。</p>
       </div>`
      :
      `<div>
        <h2>定期報告</h2>
        <p>「定期報告」は、2週間に1回、実施してください。</p>
        <p>
            急を要すると判断されるような事柄や、困ったことや相談したいことについては、「留学生サポートデスク」等への連絡、
            担当教員へのTeamsチャットを通じての連絡をしてください。
        </p>
        </div>`
  ;

  if (students.length == 1) {
    const user = students[0];
    if (parameters.query) {
      bodyTemplate.query = parameters.query || "all";
      bodyTemplate.title = parameters.query === 'all' ? ("提出内容一覧：" + user.displayName) : ("提出内容：" + user.displayName);
    } else {
      bodyTemplate.query = "";
      bodyTemplate.title = "提出状況一覧：" + user.displayName;
    }
  } else if (students.length > 1) {
    bodyTemplate.query = "";
    bodyTemplate.title = "担当する学生達の提出状況一覧";
  } else {
    throw new Error("no member!");
  }
}
