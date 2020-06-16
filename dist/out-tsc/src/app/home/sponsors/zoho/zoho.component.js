import { __decorate } from "tslib";
import { Component } from '@angular/core';
import { Validators } from '@angular/forms';
import pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
let ZohoComponent = /** @class */ (() => {
    let ZohoComponent = class ZohoComponent {
        constructor(formBuilder, sponsorService, router, title, meta) {
            this.formBuilder = formBuilder;
            this.sponsorService = sponsorService;
            this.router = router;
            this.title = title;
            this.meta = meta;
            this.intrests = ['Services', 'Products', 'Miscellaneous'];
            this.sponsorsEmail = 'Kritikabhansali@tantraa.net';
            this.submitted = false;
        }
        ngOnInit() {
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
        scroll(el) {
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
                };
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
            let docDefinition = {};
            pdfMake.createPdf(docDefinition).download('Zoho');
        }
        // diable pressing e in Phone & number fields
        isKeyValid(e) {
            const r = e.which ? e.which : e.keyCode;
            return !(r > 31 && (r < 48 || r > 57) && 43 !== r && 8 !== r && 43 !== r && 127 !== r);
        }
    };
    ZohoComponent = __decorate([
        Component({
            selector: 'app-zoho',
            templateUrl: './zoho.component.html',
            styleUrls: ['./zoho.component.scss']
        })
    ], ZohoComponent);
    return ZohoComponent;
})();
export { ZohoComponent };
//# sourceMappingURL=zoho.component.js.map