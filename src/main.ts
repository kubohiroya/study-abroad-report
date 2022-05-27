import {StringUtil} from './StringUtil';
import {DriveUtil} from './DriveUtil';
import {ScheduleSheetModule} from './ScheduleSheetModule';
import {doGet, include} from './doGet';
import {onOpen} from './onOpen';
import {onTimer} from './onTimer';
import {LogHolderModule} from './LogHolder';
import {updateDelayStatus} from './updateDelayStatus';

declare const global: {
  [key: string]: unknown;
};

global.doGet = doGet;
global.onOpen = onOpen;
global.onTimer = onTimer;
global.getLogs = LogHolderModule.getLogs;
global.getDriveFileHTML = DriveUtil.getDriveFileHTML;
global.sanitize = StringUtil.sanitize;
global.updateScheduleCellValues = ScheduleSheetModule.updateScheduleCellValues;
global.updateDelayStatus = updateDelayStatus;
global.include = include;

