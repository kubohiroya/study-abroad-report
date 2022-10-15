import {LogBase} from "./LogBase";

export type ReportLog = {
    healthStatus: string;
    healthMemo: string;
    attendStatus: string;
    absentReason: string;
    studySelfReview: string;
    researchSelfReview: string;
    studyPhoto: string[],
    personalLifeSelfReview: string;
    personalLifePhoto: string[]
} & LogBase;