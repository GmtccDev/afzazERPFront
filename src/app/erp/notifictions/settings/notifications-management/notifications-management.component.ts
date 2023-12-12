import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';

@Component({
	selector: 'app-notifications-management',
	templateUrl: './notifications-management.component.html',
	styleUrls: ['./notifications-management.component.scss']
})
export class NotificationsManagementComponent implements OnInit {
	selectedUserList: string;
	selectedOccursTimeList: string;
	selectedEndDateList: string;
	editor = ClassicEditor;
	data: any = `<p style=""></p></p>`;
	timeList = ['إرسال الان', 'جدولة', 'قبل تاريخ ', 'قبل نهاية'];
	occursList = ['يومي', 'اسبوعي', 'شهري'];
	occursTimeList = ['ساعة', 'دقائق'];
	selectedOccurs: string;
	selectedOption: string = null;
	selectedDate: string;

	config = {
		toolbar: [
			'undo',
			'redo',
			'|',
			'heading',
			'fontFamily',
			'fontSize',
			'|',
			'bold',
			'italic',
			'underline',
			'fontColor',
			'fontBackgroundColor',
			'highlight',
			'|',
			'link',
			'CKFinder',
			'imageUpload',
			'mediaEmbed',
			'|',
			'alignment',
			'bulletedList',
			'numberedList',
			'|',
			'indent',
			'outdent',
			'|',
			'insertTable',
			'blockQuote',
			'specialCharacters'
		],
		language: 'id',
		image: {
			toolbar: [
				'imageTextAlternative',
				'imageStyle:full',
				'imageStyle:side'
			]
		},
	}
	public htmlContent = '';
	constructor(
		private router: Router,
		private fb: FormBuilder,
		private route: ActivatedRoute,
		private translate: TranslateService

	) {
	}

	ngOnInit(): void {
	}

}
