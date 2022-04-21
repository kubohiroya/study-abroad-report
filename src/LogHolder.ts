import {Log} from './Log';

export type LogHolder<T> = {
  [ayear: string]: {
    [studyAt: string]: {
      [reportNum: string]: T
    }
  }
}

export class LogHolderModule {
  static getLogsMap(map: LogHolder<{ [email: string]: Log[] }>, ayear: string, studyAt: string, reportNum: string) {
    return map[ayear] &&
      map[ayear][studyAt] &&
      map[ayear][studyAt][reportNum] &&
      map[ayear][studyAt][reportNum];
  }

  static getLogs(map: LogHolder<{ [email: string]: Log[] }>, ayear: string, studyAt: string, reportNum: string, email: string): Log[] {
    if (!map[ayear]) {
      map[ayear] = {};
    }
    if (!map[ayear][studyAt]) {
      map[ayear][studyAt] = {};
    }
    if (!map[ayear][studyAt][reportNum]) {
      map[ayear][studyAt][reportNum] = {};
    }
    if (!map[ayear][studyAt][reportNum][email]) {
      map[ayear][studyAt][reportNum][email] = [];
    }
    return map[ayear][studyAt][reportNum][email];
  }
}
