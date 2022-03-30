import {Schedule} from './Schedule';

export type ScheduleHolder = {
  [ayear: string]: {
    [studyAt: string]: Schedule[]
  }
}
