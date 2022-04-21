import {ActiveSpreadsheet} from './ActiveSpreadsheet';

export class Config {
  static faviconId = ActiveSpreadsheet.config.get('faviconId');
  static dashboardUrl = ActiveSpreadsheet.config.get('dashboardUrl');
  static ayearEntryId = ActiveSpreadsheet.config.get('ayearEntryId');
  static studyAtEntryId = ActiveSpreadsheet.config.get('studyAtEntryId');
  static reportNumEntryId = ActiveSpreadsheet.config.get('reportNumEntryId');

  static COLINDEX_MEMBER_AYEAR = 0; // memberシートの0スタートで0カラム目が「ayear」
  static COLINDEX_MEMBER_ACCOUNTID = 2; // memberシートの0スタートで2カラム目が「accountId」
  static COLINDEX_MEMBER_STUDYAT = 4; // memberシートの0スタートで4カラム目が「研修先大学」
  static COLINDEX_MEMBER_TEACHER = 5; // memberシートの0スタートで5カラム目が「担当教員」

  static COLINDEX_LOGSHEET_TIMESTAMP = 0; // logシートの0スタートで0カラム目が「timestamp」
  static COLINDEX_LOGSHEET_EMAIL = 1; // logシートの0スタートで2カラム目が「email」
  static COLINDEX_LOGSHEET_EDITURL = 2; // logシートの0スタートで2カラム目が「editURL」
  static COLINDEX_LOGSHEET_STUDYAT = 3; // logシートの0スタートで3カラム目が「研修先大学」
  static COLINDEX_LOGSHEET_REPORTNUM = 4; // logシートの0スタートで4カラム目が「報告回」

  static COLINDEX_SCHEDULESHEET_AYEAR = 0; // scheduleシートの0スタートでの0カラム目が「年度」
  static COLINDEX_SCHEDULESHEET_STUDYAT = 1; // scheduleシートの0スタートでの1カラム目が「研修先大学」

  static COLINDEX_MAILTEMPLATE_NAME = 0;
  static COLINDEX_MAILTEMPLATE_SUBJECT = 1;
  static COLINDEX_MAILTEMPLATE_BODY = 2;

  static domain = "cuc.global";
  static teamsDomain = "cuc.ac.jp";

  static DEBUG = false;
}

