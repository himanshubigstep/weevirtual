import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SponsorsService } from '../../../shared/services/sponsors.service';
import { Router } from '@angular/router';
import pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { Meta, Title } from '@angular/platform-browser';

declare var $: any;
@Component({
  selector: 'app-oddup',
  templateUrl: './oddup.component.html',
  styleUrls: ['./oddup.component.scss']
})

export class OddupComponent implements OnInit {

  sponsorsEmail = 'Kritikabhansali@tantraa.net';
  contactForm: FormGroup;
  intrests: any = ['Services', 'Products', 'Miscellaneous'];

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
    this.title.setTitle('Oddup Partnering - NOW Leaders Of Tomorrow - Season 8 | Largest Entrepreneurship Platform | ET NOW');
    this.meta.addTags([
      { name: 'description', content: 'Oddup is the leading company in startup ratings and analysis, with ICO and cryptocurrency rankings, helping investors and startups navigate the ICO, crypto and venture capital landscape.' },
      { name: 'keywords', content: 'Largest Entrepreneurship Platform, ET NOW, Leaders Of Tomorrow Season 8, Oddup - Knowledge partner' }
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

  onSubmit() {

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

  scroll(el: HTMLElement) {
    const pos = el.style.position;
    const top = el.style.top;
    el.style.position = 'relative';
    el.style.top = '-82px';
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    el.style.top = top;
    el.style.position = pos;

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


    pdfMake.createPdf(docDefinition).download('Odd up');
  }

}
