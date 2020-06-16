import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { HttpService } from './http.service';
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  currentUser;
  deviceId;
  loggedIn = new BehaviorSubject<boolean>(false);
  userData = new BehaviorSubject<any>(null);
  userId = new BehaviorSubject<any>(null);

  constructor(private router: Router, private http: HttpService, private https: HttpClient) { }
  // ----------------------------------------------------------------------------------------------------------------------
  // @Subject function loggedin and loggeduserdata
  // ----------------------------------------------------------------------------------------------------------------------
  get isLoggedIn(): Observable<boolean> {

    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (this.currentUser) {
      this.loggedIn.next(true);
    }
    return this.loggedIn.asObservable();
  }
  get loggedUserData(): Observable<boolean> {
    let currentuser = JSON.parse(localStorage.getItem("currentUser"));
    if (currentuser) {
      this.userData.next({
        email: currentuser.email,
        event: currentuser.event,
        id: currentuser.id,
        mobile_number: currentuser.mobile_number,
        name: currentuser.name,
        organization: currentuser.organization,
        designation:currentuser.designation
      });
    }
    return this.userData.asObservable();
  }

get userIdDetail(): Observable<any>{
  return this.userId.asObservable();
}
  register(name, email, phoneNumber, organization,designation) : Observable<any>{
    let body = {
      name: name,
      email: email,
      mobile_number: phoneNumber,
      organization: organization,
      event: 4,
      designation:designation
    }
    console.log(body);
    localStorage.setItem('register',JSON.stringify(body));
    return this.http.post('users/', body);
  }
  login(number): Observable<any> {
 
    let body = {
      mobile_number: number,
      event: 3
    }
    return this.http.post('users/login/', body);
  }

  verifyUser(user_id, otp) :  Observable<any>{
    console.log(user_id, otp);
    let body = {
      user_id: user_id,
      otp: otp
    }
    return this.http.post('users/verify-otp/', body);
  }
  registerVerify(user_id): Observable<any> {
    let body = {
      user_id: user_id
    }
    return this.http.post('users/register/', body);
  }
  verifyEmail(url_code,userid): Observable<any> {
    let body = {
      url_code: url_code,
      user_id:userid
    }
    return this.http.post('/users/verify-email/', body);
  }
  checkVerification(user_id): Observable<any> {
    let body = {
      user_id: user_id
    }
    return this.http.post('/users/status-check/', body);
  }
  resendOtp(userid){
    let body = {
      user_id: userid
    }
    return this.http.post('/users/resend-otp/',body);
  }
}

