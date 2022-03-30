import {SendMailModule} from './SendMailModule';

export function onTimer() { // wake up every 1 hour
  const date = new Date();
  SendMailModule.sendCustomizedMailsByDate(date);
}
