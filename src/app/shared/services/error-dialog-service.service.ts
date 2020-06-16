import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ErrorDialogServiceService {

  constructor() { }

  openDialog(data):void {
    if (data.status == "500") {
      alert("Internal Server Error");
    }
  }
}
