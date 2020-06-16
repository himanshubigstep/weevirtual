import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from "../../../environments/environment";
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class HttpService {
  private baseURL = environment.baseURL;

  constructor(private http: HttpClient) { }

  get(endpoint: string): Observable<any> {
    return this.http.get(this.baseURL + endpoint);
  }

  post(endpoint: string, data: any): Observable<any> {
    return this.http.post(this.baseURL + endpoint, data);
  }

  put(endpoint: string, data: any): Observable<any> {
    return this.http.put(this.baseURL + endpoint, data);
  }

  delete(endpoint: string, data: any): Observable<any> {
    return this.http.delete(this.baseURL + endpoint, data);
  }
}
