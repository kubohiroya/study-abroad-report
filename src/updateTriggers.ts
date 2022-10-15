import Form = GoogleAppsScript.Forms.Form;
import {SpreadsheetModule} from "./SpreadsheetModules";

export function updateTriggers(){
    const formEditUrlArray = SpreadsheetModule.getConfigValues('formEditUrl');
    const triggers = ScriptApp.getProjectTriggers();

    formEditUrlArray.forEach((formEditUrl: string) => {
        const form: Form = FormApp.openByUrl(formEditUrl);
        if(! triggers.some(trigger=>trigger.getHandlerFunction() === 'onFormSubmit')){
            ScriptApp.newTrigger("onFormSubmit")
                .forForm(form)
                .onFormSubmit()
                .create();
        }
    });

    if(! triggers.some(trigger=>trigger.getHandlerFunction() === 'onTimer')){
        ScriptApp.newTrigger("onTimer")
            .timeBased()
            .everyHours(1)
            .create();
    }
}
