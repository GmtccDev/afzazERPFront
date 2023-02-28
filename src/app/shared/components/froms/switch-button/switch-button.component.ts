import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { ControlContainer, ControlValueAccessor, FormControl, FormControlDirective, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ObjectIsNotNullOrEmpty } from 'src/app/shared/helper/helper';

@Component({
  selector: 'app-switch-button',
  templateUrl: './switch-button.component.html',
  styleUrls: ['./switch-button.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: SwitchButtonComponent,
      multi: true
    }
  ]

})
export class SwitchButtonComponent implements ControlValueAccessor
 {

	@Input() labelName='';
	@Input() inputName='';
	@Input() inputId='';
	@Input() type='';
	@Input() formControl!: FormControl;
	@Input() formControlValue!: boolean;
	@Input() formControlName!: string;

	@ViewChild(FormControlDirective, {static: true})formControlDirective: FormControlDirective | undefined;
	private value!: string;
	private disabled!: boolean;
	  constructor(private controlContainer: ControlContainer) { }

	  ngOnInit(): void {
	  }

	   get control() {
		;
			return this.formControl || this.controlContainer?.control?.get(this.formControlName);
		  }

		  ngOnChanges(): void {
			;

			//Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
			//Add '${implements OnChanges}' to the class.

			this.formControlValue=this.controlContainer?.control?.get(this.formControlName).value;
		  }

		  registerOnTouched(fn: any): void {

			this.formControlDirective?.valueAccessor?.registerOnTouched(fn);
		  }

		  registerOnChange(fn: any): void {
			this.formControlDirective?.valueAccessor?.registerOnChange(fn);
		  }

		  writeValue(obj: any): void {
			this.formControlDirective?.valueAccessor?.writeValue(obj);
		  }

}
