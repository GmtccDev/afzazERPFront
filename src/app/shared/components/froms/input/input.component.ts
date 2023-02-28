import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ControlContainer, ControlValueAccessor, FormControl, FormControlDirective, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: InputComponent,
      multi: true
    }
  ]
})
export class InputComponent implements ControlValueAccessor {

	@Input() labelName!:string;
	@Input() inputName!:string;
	@Input() type!:string;
	@Input() formControl!: FormControl;
	@Input() formControlName!: string;

	@ViewChild(FormControlDirective, {static: true})formControlDirective: FormControlDirective | undefined;
	private value!: string;
	private disabled!: boolean;
	  constructor(private controlContainer: ControlContainer) { }

	  ngOnInit(): void {
	  }

	  
	   get control() {

			return this.formControl || this.controlContainer?.control?.get(this.formControlName);
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


