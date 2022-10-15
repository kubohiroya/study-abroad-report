import {LogBase} from "./LogBase";

export type HealthLog = {
  temperature: number;
  description: string;
} & LogBase;
