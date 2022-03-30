import {StringUtil} from './StringUtil';
import {DriveUtil} from './DriveUtil';
// import {DateUtil} from './DateUtil';
import {LogSheetModule} from './LogSheetModule';
import {ScheduleSheetModule} from './ScheduleSheetModule';
import {doGet, include} from './doGet';
import {onOpen} from './onOpen';
import {onTimer} from './onTimer';

declare const global: {
  [key: string]: unknown;
};

global.doGet = doGet;
global.onOpen = onOpen;
global.onTimer = onTimer;
global.getLogArray = LogSheetModule.getLogArray;
global.getDriveFileHTML = DriveUtil.getDriveFileHTML;
global.sanitize = StringUtil.sanitize;
global.updateScheduleCellValues = ScheduleSheetModule.updateScheduleCellValues;
global.include = include;
