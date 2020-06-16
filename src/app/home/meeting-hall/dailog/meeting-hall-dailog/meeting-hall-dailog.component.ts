import { Component, OnInit ,Inject } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {MatTabsModule} from '@angular/material/tabs';


@Component({
  selector: 'app-meeting-hall-dailog',
  templateUrl: './meeting-hall-dailog.component.html',
  styleUrls: ['./meeting-hall-dailog.component.scss']
})
export class MeetingHallDailogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<MeetingHallDailogComponent>,
    //@Inject(MAT_DIALOG_DATA)

    ) {}
  public imagePath;
  imgURL: any;
  public message: string;
 
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
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }


  ngOnInit(): void {
  }

}
