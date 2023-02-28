import { Validators } from "@angular/forms";
import { EMAILREGEX, MOBILEREGEX, SPACEREGEX } from "./constant";

export let NAME_VALIDATORS=['', Validators.compose([  Validators.pattern(SPACEREGEX),Validators.minLength(2),Validators.maxLength(100)])];
export let EMAIL_VALIDATORS=['', Validators.compose([Validators.email, Validators.pattern(EMAILREGEX)])];
export let MOBILE_VALIDATORS = ['', [ Validators.pattern(MOBILEREGEX) ]]
export let NAME_REQUIRED_VALIDATORS=['', Validators.compose([ Validators.required,Validators.minLength(2),Validators.maxLength(100)])];
export let PHONE_VALIDATORS = ['', Validators.compose([ Validators.pattern(MOBILEREGEX) ])]
export let FAX_VALIDATORS = ['', Validators.compose([ Validators.pattern(MOBILEREGEX) ])]
export let REQUIRED_VALIDATORS = ['', Validators.compose([ Validators.required])]
export let CODE_REQUIRED_VALIDATORS=['', Validators.compose([ Validators.required,Validators.minLength(1),Validators.maxLength(100)])];


