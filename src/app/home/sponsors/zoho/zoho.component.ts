import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  Validators
} from '@angular/forms';
import { SponsorsService } from '../../../shared/services/sponsors.service';
import { Router } from '@angular/router';
import pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { Meta, Title } from '@angular/platform-browser';

declare var $: any;

@Component({
  selector: 'app-zoho',
  templateUrl: './zoho.component.html',
  styleUrls: ['./zoho.component.scss']
})
export class ZohoComponent implements OnInit {

  contactForm: FormGroup;
  intrests: any = ['Services', 'Products', 'Miscellaneous'];
  sponsorsEmail = 'Kritikabhansali@tantraa.net';
  submitted = false;

  constructor(
    private formBuilder: FormBuilder,
    private sponsorService: SponsorsService,
    private router: Router,
    private title: Title,
    private meta: Meta
  ) { }

  ngOnInit(): void {
    this.loadForm();
    this.loadCarouselScript();

    // SEO Meta Tags
    this.title.setTitle('Zoho One Partnering - Leaders Of Tomorrow - Season 8 | Largest Entrepreneurship Platform | ET NOW');
    this.meta.addTags([
      { name: 'description', content: 'Grow your business with one smart and customizable system of integrated software for sales, marketing, support, accounting, operations and HR.' },
      { name: 'keywords', content: 'Largest Entrepreneurship Platform, ET NOW, Leaders Of Tomorrow Season 8, Zoho One - Software partner' }
    ]);

  }

  loadForm() {
    this.contactForm = this.formBuilder.group({
      name: [null, [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]],
      email: [null, [Validators.required, Validators.email, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
      mobile: [null, [Validators.required, Validators.pattern('^([+][9][1]|[9][1]|[0]){0,1}([6-9]{1})([0-9]{9})$')]],
      intrests: ['', [Validators.required]]
    });
  }

  scroll(el: HTMLElement) {
    const pos = el.style.position;
    const top = el.style.top;
    el.style.position = 'relative';
    el.style.top = '-82px';
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    el.style.top = top;
    el.style.position = pos;

  }

  onSubmit() {
    this.submitted = true;
    if (this.contactForm.valid) {
      let body = {
        sponsor_email: this.sponsorsEmail,
        name: this.contactForm.value.name,
        mobile_number: this.contactForm.value.mobile,
        message: 'nothing',
        email: this.contactForm.value.email,
        intrests: this.contactForm.value.intrests
      }
      this.sponsorService.sendEnquiryDetails(body).subscribe(response => {
        console.log(response);
      });
    }
  }

  navigatetoLounge() {
    this.router.navigate(['/home/lounge']);
  }

  // load carousel
  loadCarouselScript() {
    $('.owl-carousel').owlCarousel({
      dots: false,
      autoplay: false,
      autoplayHoverPause: true,
      responsiveClass: true,
      responsive: {
        0: {
          items: 1,
          nav: true,
          loop: true,
        },
        767: {
          items: 1,
          nav: true,
          loop: true,
        },
        991: {
          items: 1,
          nav: true,
          loop: true,
        },
      },
    });
  }

  //Download
  downloadPdf() {
    let doc = [];
    pdfMake.vfs = pdfFonts.pdfMake.vfs;
    let docDefinition = {}
    pdfMake.createPdf(docDefinition).download('Zoho');
  }

  // diable pressing e in Phone & number fields
  isKeyValid(e) {
    const r = e.which ? e.which : e.keyCode;
    return !(r > 31 && (r < 48 || r > 57) && 43 !== r && 8 !== r && 43 !== r && 127 !== r)
  }

}
