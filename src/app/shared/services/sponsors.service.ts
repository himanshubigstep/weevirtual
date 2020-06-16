import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SponsorsService {

  constructor(private http: HttpService) { }

  sendEnquiryDetails(body) {
    return this.http.post('events/enquiry/', body);
  }
}
