import {StringUtil} from './StringUtil';
import {DriveUtil} from './DriveUtil';
import {doGet/*, getJson*/} from './doGet';
import {onOpen, updateConfigSheet} from './onOpen';
import {onTimer} from './onTimer';
import {LogHolderModule} from './LogHolder';
import {updateDelayStatus} from './updateDelayStatus';
import {updateTriggers} from "./updateTriggers";
import {updateScheduleCellValues} from "./updateScheduleCellValues";
import {onFormSubmit} from "./onFormSubmit";

declare const global: {
  [key: string]: unknown;
};

global.doGet = doGet;
global.onOpen = onOpen;
global.onTimer = onTimer;
global.onFormSubmit = onFormSubmit;

global.getLogs = LogHolderModule.getLogs;
global.getDriveFileHTML = DriveUtil.getDriveFileHTML;
global.sanitize = StringUtil.sanitize;

global.updateScheduleCellValues = updateScheduleCellValues;
global.updateDelayStatus = updateDelayStatus;
global.updateTriggers = updateTriggers;
global.updateConfigSheet = updateConfigSheet;

// global.getJson = getJson;
