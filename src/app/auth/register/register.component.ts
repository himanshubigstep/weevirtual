import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  Validators
} from '@angular/forms';
import { AuthService } from '../../shared/services/auth.service';
import { Router, NavigationStart } from '@angular/router';
import { Subscription } from 'rxjs';
export let browserRefresh = false;
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  registerForm: FormGroup;
  submitted = false;
  interval;
  timeLeft;
  clickOnContinue = false;

  registerationDetails = {
    name: null,
    email: null,
    mobile_number: null,
    organization: null,
    event: null,
    designation: null
  };

  erroMessage = false;
  registerationError = false;
  subscription: Subscription;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private title: Title,
    private meta: Meta
  ) {
  }

  ngOnInit(): void {
    localStorage.setItem('reload', 'true');
    if (localStorage.getItem('register') && localStorage.getItem('refresh')) {
      this.registerationDetails = JSON.parse(localStorage.getItem('register'));
      this.erroMessage = true;
      localStorage.removeItem('refresh');
    }
    this.registerForm = this.formBuilder.group({
      name: [this.registerationDetails.name, [Validators.required]],
      email: [this.registerationDetails.email, [Validators.required, Validators.email, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
      phoneNumber: [this.registerationDetails.mobile_number, [Validators.required, Validators.pattern('^([+][9][1]|[9][1]|[0]){0,1}([6-9]{1})([0-9]{9})$')]],
      organization: [this.registerationDetails.organization, [Validators.required]],
      designation: [this.registerationDetails.designation, [Validators.required]]
    });

    this.authService.userIdDetail.subscribe(userIdData => {
      if (userIdData) {
        this.authService.checkVerification(userIdData).subscribe(response => {
          let res = response;
          if (res.sms_verification) {
            this.registerForm.controls['phoneNumber'].disable();
          }
          if (res.email_verification) {
            this.registerForm.controls['email'].disable();
          }
        });
      }
    });

    // SEO Meta Tags
    this.title.setTitle('Registration Form | Leaders Of Tomorrow - Season 8 | Largest Entrepreneurship Platform | ET NOW');
    this.meta.addTags([
      { name: 'description', content: 'Register for Session On Technology and Innovation for Sustainability. Leaders Of Tomorrow - Season 8 by ET NOW India’s largest entrepreneurship platform' },
      { name: 'keywords', content: 'Registration Form, Largest Entrepreneurship Platform, ET NOW, Leaders Of Tomorrow Season 8' }
    ]);

  }
  
  get regform() { return this.registerForm.controls; }

  onContinue() {
    this.submitted = true;
    if (this.registerForm.valid) {
      this.clickOnContinue = true;
      this.registerForm.controls['phoneNumber'].enable();
      this.registerForm.controls['email'].enable();
      this.authService.register(this.registerForm.value.name,
        this.registerForm.value.email, this.registerForm.value.phoneNumber, this.registerForm.value.organization, this.registerForm.value.designation).subscribe(response => {
          let res = response;
          if (res.id) {
            localStorage.setItem('reloadRegister', 'true');
            this.router.navigate(['verify', res.id, 'reg']);
          }
        }, (error => {
          this.clickOnContinue = false;
          this.registerationError = true;
        }));
    } else {
      console.log("Invalid Form");
    }
  }

  navigatetologin() {
    this.router.navigate(['/auth/login']);
  }



}
