import { __decorate } from "tslib";
import { Component } from '@angular/core';
let MeetingHallDailogComponent = /** @class */ (() => {
    let MeetingHallDailogComponent = class MeetingHallDailogComponent {
        constructor(dialogRef) {
            this.dialogRef = dialogRef;
        }
        preview(files) {
            if (files.length === 0)
                return;
            var mimeType = files[0].type;
            if (mimeType.match(/image\/*/) == null) {
                this.message = "Only images are supported.";
                return;
            }
            var reader = new FileReader();
            this.imagePath = files;
            reader.readAsDataURL(files[0]);
            reader.onload = (_event) => {
                this.imgURL = reader.result;
            };
        }
        onNoClick() {
            this.dialogRef.close();
        }
        ngOnInit() {
        }
    };
    MeetingHallDailogComponent = __decorate([
        Component({
            selector: 'app-meeting-hall-dailog',
            templateUrl: './meeting-hall-dailog.component.html',
            styleUrls: ['./meeting-hall-dailog.component.scss']
        })
    ], MeetingHallDailogComponent);
    return MeetingHallDailogComponent;
})();
export { MeetingHallDailogComponent };
//# sourceMappingURL=meeting-hall-dailog.component.js.map