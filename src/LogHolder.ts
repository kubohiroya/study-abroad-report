export type LogHolder<T> = {
  [ayear: string]: {
    [studyAt: string]: {
      [reportNum: string]: T
    }
  }
}
