import {Member} from './Member';
import {ActiveSpreadsheet} from './ActiveSpreadsheet';
import {Config} from './Config';

export class MemberSheetModule {

  memberRows: any[][];

  constructor() {
    if (!ActiveSpreadsheet.logSheet) {
      throw new Error("Not found sheet 'log'");
    }
    if (!ActiveSpreadsheet.memberSheet) {
      throw new Error("Not found sheet 'member'");
    }
    this.memberRows = ActiveSpreadsheet.memberSheet.getDataRange().getValues().filter((row: any[], index: number) => index > 0 && row[0]);
  }

  static getAccountId(email: string) {
    return email.indexOf('@') > 0 ? email.split('@')[0] : email;
  }

  static createStudent(row: Array<string>): Member {
    const [ayear, studentId, accountId, displayName, studyAt, teacher, memo, checklists, goals] = row;
    const teacherAccountId = MemberSheetModule.getAccountId(teacher);
    return {
      ayear, studentId, accountId, displayName, studyAt, teacher,
      teacherAccountId,
      teacherEmail: teacherAccountId + '@' + Config.teamsDomain,
      checklists, goals
    };
  }

  getStudent(activeUserEmail: string): Member | null {
    const accountId = MemberSheetModule.getAccountId(activeUserEmail);
    const members = this.memberRows.filter((row: any[]) => row[Config.COLINDEX_MEMBER_ACCOUNTID] === accountId).map((row: any[]) => {
      return MemberSheetModule.createStudent(row);
    });
    if (members.length === 1) {
      return members[0];
    }
    if (members.length === 0) {
      return null;
    }
    throw new Error(`duplicated rows(${members.length}) in member sheet about user: ${accountId}`);
  }

  isTeacher(activeUserEmail: string): boolean {
    return this.memberRows.some((row: any[]) => row[Config.COLINDEX_MEMBER_TEACHER] == activeUserEmail);
  }

  getStudentArray(teacherEmail: string): Member[] {
    return this.memberRows.filter((row: any[]) => row[Config.COLINDEX_MEMBER_TEACHER] == teacherEmail).map((row: any[]) => {
      return MemberSheetModule.createStudent(row);
    }).sort((a, b) => a.studentId < b.studentId ? -1 : 1);
  }

  getMemberMap() {
    const ret: { [key: string]: Array<Member> } = {};
    const members = this.memberRows.map((row: any[]) => {
      return MemberSheetModule.createStudent(row);
    });
    members.forEach((member: Member) => {
      const key = `${member.ayear}\t${member.studyAt}`;
      if (!ret[key]) {
        ret[key] = [];
      }
      ret[key].push(member);
    });
    return ret;
  }
}
