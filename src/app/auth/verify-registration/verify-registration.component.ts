import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../shared/services/auth.service';
import { HttpParams } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { EventService } from '../../shared/services/event.service';


@Component({
  selector: 'app-verify-registration',
  templateUrl: './verify-registration.component.html',
  styleUrls: ['./verify-registration.component.scss']
})
export class VerifyRegistrationComponent implements OnInit {

  verifyForm: FormGroup;
  code;
  registerBtn = true;
  user_id;
  encryptedCode;
  VerifyOTP = false;
  VerifyEmail = false;
  type;
  otpError = false;
  otpSent = false;
fadeOTPmessage =false;
fadeEmailmessage = false;
bothAreVerified = false;
  public settings = {
    length: 4,
    numbersOnly: true,
    timer: 45
  }
checkVerificationStatus ;
  constructor(private formBuilder: FormBuilder,
    private authService: AuthService, private router: Router,
    private eventService: EventService, private activatedroute: ActivatedRoute) { }

  ngOnInit(): void {
    localStorage.setItem('reload','true');
    this.user_id = this.activatedroute.snapshot.paramMap.get('user_id');
    this.type = this.activatedroute.snapshot.paramMap.get('type');
    this.authService.userId.next(this.user_id);
    if (this.activatedroute.snapshot.paramMap.get('url')) {
      if(localStorage.getItem('reloadRegister')){
        localStorage.removeItem('reloadRegister');
      window.location.reload();
      
      }
      this.encryptedCode = this.activatedroute.snapshot.paramMap.get('url');
      this.onVerifyEmail();
    }
if(this.type == 'reg'){
 this.checkVerificationStatus = setInterval(()=>{
  this.authService.checkVerification(this.user_id).subscribe(response => {
    console.log("calling status api");
    let res = response;
    if (this.type != 'login') {
      this.VerifyEmail = res.email_verification;
      this.VerifyOTP = res.sms_verification;
    }
    this.fadeMessages();
    if (this.VerifyOTP && this.VerifyEmail){
      this.registerBtn = false;
      this.bothAreVerified = true;
      console.log("clearing status api");
    clearInterval(this.checkVerificationStatus);
    }
  });
 },5000)  ; 
}
  }
  onVerifyOtp() {
    this.authService.verifyUser(this.user_id, this.code).subscribe(response => {
      console.log(response);
      this.VerifyOTP = true;
      this.fadeMessages();
      if (this.VerifyEmail)
        this.registerBtn = false;
    },(error => {
      this.otpError = true;
    }));
  }
  onVerifyEmail() {
    this.authService.verifyEmail(this.encryptedCode,this.user_id).subscribe(response => {
      console.log(response);
      this.VerifyEmail = true;
      this.fadeMessages();
      if (this.VerifyOTP)
        this.registerBtn = false;
    });
  }
  fadeMessages(){
    if(this.VerifyOTP){
      setTimeout(()=>{
        this.fadeOTPmessage = true;
        
      },5000);
    }else if(this.VerifyEmail){
      setTimeout(()=>{
        this.fadeEmailmessage = true;
      },5000);
    }
  }
  onSubmit() {
    if (this.VerifyOTP) {
      this.authService.registerVerify(this.user_id).subscribe(response => {
        console.log(response);
          let res = response;
          let user = {
            email: res.user_details.email,
            event: res.user_details.event,
            id: res.user_details.id,
            mobile_number: res.user_details.mobile_number,
            name: res.user_details.name,
            organization: res.user_details.organization,
            designation:res.user_details.designation,
            type:res.user_details.user_type
          }
          localStorage.setItem('currentUser', JSON.stringify(user));
          localStorage.setItem('details', JSON.stringify(res));
          localStorage.setItem('token',res.user_details.token);
          this.authService.userData.next({
            email: res.user_details.email,
            event: res.user_details.event,
            id: res.user_details.id,
            mobile_number: res.user_details.mobile_number,
            name: res.user_details.name,
            organization: res.user_details.organization,
            designation:res.user_details.designation,
            type:res.user_details.user_type
          });
          this.eventService.eventDetailsUpdate();
          clearInterval(this.checkVerificationStatus);
        this.router.navigate(['/home/lounge']);
      });
      // hi
    } else {
      console.log('Invalid OTP');
    }
  }
  onLogin() {
    this.authService.verifyUser(this.user_id, this.code).subscribe(response => {
      console.log(response);
      let res = response;
      if (res.message) {
        this.authService.registerVerify(this.user_id).subscribe(response => {
          let res = response;
          let user = {
            email: res.user_details.email,
            event: res.user_details.event,
            id: res.user_details.id,
            mobile_number: res.user_details.mobile_number,
            name: res.user_details.name,
            organization: res.user_details.organization,
            designation:res.user_details.designation,
            type:res.user_details.user_type
          }
          localStorage.setItem('currentUser', JSON.stringify(user));
          localStorage.setItem('details', JSON.stringify(res));
          localStorage.setItem('token',res.user_details.token);
          this.authService.userData.next({
            email: res.user_details.email,
            event: res.user_details.event,
            id: res.user_details.id,
            mobile_number: res.user_details.mobile_number,
            name: res.user_details.name,
            organization: res.user_details.organization,
            designation:res.user_details.designation,
            type:res.user_details.user_type
          });
          this.eventService.eventDetailsUpdate();
          if(res.user_details.user_type == 'admin'){
            this.router.navigate(['/home/meeting-hall']);
          }else{
          this.router.navigate(['/home/lounge']);
          }
        });
        // hi
      } else {
        console.log('Invalid OTP');
      }
    },(error => {
      this.otpError = true;
    }));
  }
  navigateToRegister() {
    this.router.navigate(['/auth']);
  }
  navigateToback(){
localStorage.setItem('refresh','true');

    if(this.type=='reg'){
      this.router.navigate(['/auth']);
    }else{
      this.router.navigate(['/auth/login']);
    }
  }
  navigatetolounge() {
    this.router.navigate(['/lounge']);
  }
  navigatetologin() {
    this.router.navigate(['/auth/login']);
  }
  resendCode() {
    this.authService.resendOtp(this.user_id).subscribe(res => {
      console.log(res);
      this.otpSent = true;
    });
  }

  // otp 
  disabledClass() {
    if (this.registerBtn) {
      return {
        disabled: true
      };
    } else {
      return {
        disabled: false
      };
    }
  }

  public onInputChange(e) {
    console.log(e);
    if (e.length == this.settings.length) {
      // e will emit values entered as otp and,
      this.code = e;
    } else if (e == -1) {
      // if e == -1, timer has stopped
      console.log(e, 'resend button enables');
    } else if (e == -2) {
      // e == -2, button click handle
      console.log('resend otp');
      this.resendCode();
    }
  }
  navigatetoregister(){
    this.router.navigate(['/auth']);
  }
}
// 