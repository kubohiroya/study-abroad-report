import {MemberSheetModule} from './MemberSheetModule';
import {ScheduleSheetModule} from './ScheduleSheetModule';
import {LogSheetModule} from './LogSheetModule';
import {APP_MODE, Config, SHEET_PREFIX} from './Config';
import {Member} from './Member';
import {SheetGroup} from "./SheetGroup";
import {LogHolderModule} from "./LogHolder";
import {Logs} from "./Logs";
import {ScheduleHolder} from "./ScheduleHolder";
import {Schedule} from "./Schedule";
import HtmlTemplate = GoogleAppsScript.HTML.HtmlTemplate;

function getMode(parameters: any): APP_MODE {
  return (parameters.mode && parameters.mode.length === 1 && parameters.mode[0] === APP_MODE.HEALTH_CHECK_MODE) ?
      APP_MODE.HEALTH_CHECK_MODE : APP_MODE.REPORT_MODE;
}

function getPrefix(mode: APP_MODE): SHEET_PREFIX {
  return mode === APP_MODE.HEALTH_CHECK_MODE? SHEET_PREFIX.HEALTH_CHECK_PREFIX : SHEET_PREFIX.REPORT_PREFIX;
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

function getContext(req: {parameters:{query?:string}}, students: Array<Member>){
  let title;
  let query;
  if (students.length == 1) {
    const user = students[0];
    if (req.parameters.query) {
      query = req.parameters.query || "all";
      title = req.parameters.query === 'all' ? ("提出内容一覧：" + user.displayName) : ("提出内容：" + user.displayName);
    } else {
      query = "";
      title = "提出状況一覧：" + user.displayName;
    }
  } else if (students.length > 1) {
    query = "";
    title = "担当する学生達の提出状況一覧";
  } else {
    throw new Error("no member!");
  }
   return {query, title};
}

const templateCache = new Map<string, HtmlTemplate>();
function getTemplate(name: string){
  let template = templateCache.get(name);
  if(! template){
    template = HtmlService.createTemplateFromFile(name)
    templateCache.set(name, template);
  }
  return template;
}

function elem(name: string, props: Object): string{
  const template = getTemplate(name);
  Object.entries(props).forEach((entry)=>{
    const [key, value] = entry;
    template[key] = value;
  })
  return template.evaluate().getContent();
}

function studentReportSetByProgram (
    mode: APP_MODE,
    query: string,
    student: Member,
    ayear: string,
    studyAt: string,
    activeUserAccountId: string,
    urlBase: string,
    reportSchedules: Array<Schedule>,
    reports: any,
) {
  let numDisplayedRows = 0;
  const now = new Date().getTime();

  const rows = [] as Array<{ schedule: Schedule, urlBase: string, matchedReport: Logs, isDelayedSubmit: boolean, isDelayedNoSubmit: boolean, numDisplayedRows: number }>;
  reportSchedules.forEach((schedule) => {
    const reportArray = LogHolderModule.getLogs(reports, schedule.ayear, schedule.studyAt, schedule.reportNum,
        student.accountId + '@cuc.global');
    const matchedReports = reportArray.sort((a: Logs, b: Logs) => a.timestamp.getTime() - b.timestamp.getTime()).reverse();
    const matchedReport = matchedReports && matchedReports[0];

    if (!query || query == "all" ||
        (matchedReport && matchedReport.timestamp.getTime() == parseInt(query))) {
      const isDelayedSubmit = matchedReport && schedule.endJST.getTime() < matchedReport.timestamp.getTime();
      const isDelayedNoSubmit = !matchedReport && schedule.endJST.getTime() < now;
      numDisplayedRows++;
      rows.push({schedule, urlBase, matchedReport, isDelayedSubmit, isDelayedNoSubmit, numDisplayedRows});
    }
  });

  const url = urlBase + '?' + ((activeUserAccountId === student.accountId) ? '' : `student=${student.accountId}&`) + 'mode='+mode+'&' + 'query=all';

  let studentReportSetArray = '';
  Logger.log("+ "+student.studentId);
  rows.forEach((row, index) => {
    studentReportSetArray += elem('studentReportSet', {
      index,
      ayear,
      studyAt,
      url,
      mode,
      query,
      student,
      numRows: 24,
      isLastRow: (index == rows.length - 1),
      matchedReport: row.matchedReport,
      schedule: row.schedule,
      studentReport: elem('studentReport', {
        student,
        mode,
        query,
        activeUserAccountId,
        urlBase: row.urlBase,
        schedule: row.schedule,
        matchedReport: row.matchedReport,
        isDelayedSubmit: row.isDelayedSubmit,
        isDelayedNoSubmit: row.isDelayedNoSubmit,
        numDisplayedRows: row.numDisplayedRows,
      }),
      studentBiweeklyReport: elem('studentBiweeklyReport', {
        matchedReport: row.matchedReport,
      }),
      studentHealthReport: elem('studentHealthReport', {
        matchedReport: row.matchedReport,
      }),
    });
  });
  Logger.log("- "+student.studentId);

  return studentReportSetArray;
}

function reportsOfStudent(
    sheetGroup: SheetGroup,
    scheduleHolder: ScheduleHolder,
    reports: any,
    mode: APP_MODE,
    query: string,
    activeUserAccountId: string,
    student: Member
): string {

  const studentHeader = elem("studentHeader", {
    student,
    query,
    activeUserAccountId
  });

  const studentChecklists = (mode == APP_MODE.HEALTH_CHECK_MODE)? undefined : elem("studentChecklists", {student});

  const urlBase = ScriptApp.getService().getUrl();

  let studentReportSetArray = '';
  Object.keys(scheduleHolder).forEach(ayear => {
    Object.keys(scheduleHolder[ayear]).forEach(studyAt => {
      const reportSchedules = scheduleHolder[ayear][studyAt];
      studentReportSetArray += studentReportSetByProgram(mode, query, student, ayear, studyAt, activeUserAccountId, urlBase, reportSchedules, reports);
    });
  });

  return elem('reportsOfStudent',{
    student,
    studentHeader,
    studentChecklists,
    studentReportSetArray,
    query,
    activeUserAccountId
  });
}

function reportsOfStudentGroup(
    sheetGroup: SheetGroup,
    mode: APP_MODE,
    query: string,
    activeUserAccountId: string,
    students: Array<Member>
): string {

  const ayearStudyAtSet = Array.from(new Set(students.map(member => member.ayear + "\t" + member.studyAt))).sort();
  const scheduleHolder = new ScheduleSheetModule(sheetGroup).getItemMap(ayearStudyAtSet);
  const reports = new LogSheetModule(sheetGroup).getLogHolderByEmails(students.map(member => member.accountId + "@" + Config.domain));

  const map = new Map<Member,any>();
  students.forEach(student=>{
    map.set(student, reportsOfStudent(sheetGroup, scheduleHolder, reports, mode, query, activeUserAccountId, student));
  });

  return elem("reportsOfStudentGroup", {
    students,
    reportsOfStudent: map
  });
}

function body(
    sheetGroup: SheetGroup,
    mode: APP_MODE,
    query: string,
    activeUserAccountId: string,
    students: Array<Member>
): string {

  const header = mode == APP_MODE.HEALTH_CHECK_MODE?
      `<div>
       <h2>健康観察報告</h2>
       <p>「健康観察報告」は、毎日(毎朝)、実施してください。</p>
       <p>健康に関して、何らかの心配がある場合や、対応を要する場合については、「留学生サポートデスク」等への連絡、
            担当教員へのTeamsチャットを通じての連絡をしてください。</p>
       </div>`
      :`<div>
        <h2>定期報告</h2>
        <p>「定期報告」は、2週間に1回、実施してください。</p>
        <p>
            急を要すると判断されるような事柄や、困ったことや相談したいことについては、「留学生サポートデスク」等への連絡、
            担当教員へのTeamsチャットを通じての連絡をしてください。
        </p>
        </div>`
  ;

  return elem("body", {
    header,
    reportsOfStudentGroup: reportsOfStudentGroup(sheetGroup, mode, query, activeUserAccountId, students),
  });
}

export function doGet(req: { parameters: any }) {

  const sheetGroup = new SheetGroup(getPrefix(getMode(req.parameters)));

  const activeUserEmail = Session.getActiveUser().getEmail();
  const activeUserAccountId = activeUserEmail.split("@")[0];

  const faviconUrl = `https://drive.google.com/uc?id=${sheetGroup.config.get("faviconId")}&.png`;

  const mode = getMode(req.parameters);
  const me = getMeAsStudent(sheetGroup, activeUserEmail);

  const students = (me) ? [me] : getAdvisingStudents(sheetGroup, activeUserEmail, req.parameters.student);
  const {query, title} = getContext(req, students);

  const htmlTemplate = HtmlService.createTemplateFromFile("index");
  htmlTemplate.body = body(sheetGroup, mode, query, activeUserAccountId, students);
  return htmlTemplate.evaluate().setTitle(title).setFaviconUrl(faviconUrl);
}

export function include(filename: string) {
  return HtmlService.createTemplateFromFile(filename).evaluate().getContent();
}


