import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbActiveModal, NgbModal, ModalDismissReasons, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { UserService } from 'src/app/shared/common-services/user.service';
import { UserServiceProxy } from '../../security/services/user-service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [NgbModalConfig, NgbModal]
})
export class ChangePasswordComponent implements OnInit {

  ngOnInit() { 
    this.initForm();
  }

  closeResult: string;

  constructor(config: NgbModalConfig, private modalService: NgbModal,private fb: FormBuilder, private route: ActivatedRoute, private userService: UserServiceProxy,
    public router: Router) {
  	// customize default values of modals used by this component tree
    config.backdrop = 'static';
    config.keyboard = false;

  }

  open(content) {
    
    console.log("contetn---------",content)
    this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {
      console.log(" modalService content",content)
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return  `with: ${reason}`;
    }
  }

  openModal() {
    // const modalRef = this.modalService.open(NgbdModalContent);
    // modalRef.componentInstance.name = 'World';
  }

  openBackDropCustomClass(content) {
    this.modalService.open(content, {backdropClass: 'light-blue-backdrop'});
  }

  openWindowCustomClass(content) {
    this.modalService.open(content, { windowClass: 'dark-modal' });
  }

  openSm(content) {
    this.modalService.open(content, { size: 'sm' });
  }

  openLg(content) {
    this.modalService.open(content, { size: 'lg' });
  }

  openVerticallyCentered(content) {
    this.modalService.open(content, { centered: true });
  }

  // openStackedModal() {
  //   this.modalService.open(NgbdModal1Content);
  // }

  openCustomModal(content) {
    this.modalService.open(content);
  }
  passForm: FormGroup;
  initForm(): void {
  
   
    this.passForm = this.fb.group({
      oldPassword: ['', [Validators.required, Validators.minLength(8)]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmNewPassword: ['', [Validators.required, Validators.minLength(8)]]
    },
      { validator: this.doesPasswordsMatch('newPassword', 'confirmNewPassword') }
    );
  }

  get f() { return this.passForm.controls; }

  onSubmit() {
    
    this.userService.changePassWord(this.passForm.getRawValue())
      .subscribe(res => {
        if (res.success) {

         
          this.passForm.reset();
      this.modalService.dismissAll();
          this.router.navigate(['/authentication/login']);
        } 
      },
        (err) => {
          console.log(err)
        
        }
      );
  }


  doesPasswordsMatch(passwordKey: string, passwordConfirmationKey: string) {
    return (group: FormGroup) => {
      let passwordInput = group.controls[passwordKey],
        passwordConfirmationInput = group.controls[passwordConfirmationKey];
      if (passwordInput.value !== passwordConfirmationInput.value) {
        return passwordConfirmationInput.setErrors({ notEquivalent: true })
      }
      else {
        return passwordConfirmationInput.setErrors(null);
      }
    }
  }
}

