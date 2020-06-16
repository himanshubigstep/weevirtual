import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-sponsors',
  templateUrl: './sponsors.component.html',
  styleUrls: ['./sponsors.component.scss']
})
export class SponsorsComponent implements OnInit {

  contactForm: FormGroup;
  intrests: any = ['lorem', 'ipsum', 'dollar']

  constructor(
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.loadForm();
  }

  loadForm() {
    this.contactForm = this.formBuilder.group({
      user_name: [null, [Validators.required]],
      user_email: [null, [Validators.required]],
      user_mobile: [null, [Validators.required]],
      user_city: ['', [Validators.required]],
    });
  }

  onSubmit() {
    console.log(this.contactForm.value);
  }

}
