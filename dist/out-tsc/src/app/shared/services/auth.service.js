import { __decorate } from "tslib";
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
let AuthService = /** @class */ (() => {
    let AuthService = class AuthService {
        constructor(router, http, https) {
            this.router = router;
            this.http = http;
            this.https = https;
            this.loggedIn = new BehaviorSubject(false);
            this.userData = new BehaviorSubject(null);
            this.userId = new BehaviorSubject(null);
        }
        // ----------------------------------------------------------------------------------------------------------------------
        // @Subject function loggedin and loggeduserdata
        // ----------------------------------------------------------------------------------------------------------------------
        get isLoggedIn() {
            this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (this.currentUser) {
                this.loggedIn.next(true);
            }
            return this.loggedIn.asObservable();
        }
        get loggedUserData() {
            let currentuser = JSON.parse(localStorage.getItem("currentUser"));
            if (currentuser) {
                this.userData.next({
                    email: currentuser.email,
                    event: currentuser.event,
                    id: currentuser.id,
                    mobile_number: currentuser.mobile_number,
                    name: currentuser.name,
                    organization: currentuser.organization,
                    designation: currentuser.designation
                });
            }
            return this.userData.asObservable();
        }
        get userIdDetail() {
            return this.userId.asObservable();
        }
        register(name, email, phoneNumber, organization, designation) {
            let body = {
                name: name,
                email: email,
                mobile_number: phoneNumber,
                organization: organization,
                event: 4,
                designation: designation
            };
            console.log(body);
            localStorage.setItem('register', JSON.stringify(body));
            return this.http.post('users/', body);
        }
        login(number) {
            let body = {
                mobile_number: number,
                event: 3
            };
            return this.http.post('users/login/', body);
        }
        verifyUser(user_id, otp) {
            console.log(user_id, otp);
            let body = {
                user_id: user_id,
                otp: otp
            };
            return this.http.post('users/verify-otp/', body);
        }
        registerVerify(user_id) {
            let body = {
                user_id: user_id
            };
            return this.http.post('users/register/', body);
        }
        verifyEmail(url_code, userid) {
            let body = {
                url_code: url_code,
                user_id: userid
            };
            return this.http.post('/users/verify-email/', body);
        }
        checkVerification(user_id) {
            let body = {
                user_id: user_id
            };
            return this.http.post('/users/status-check/', body);
        }
        resendOtp(userid) {
            let body = {
                user_id: userid
            };
            return this.http.post('/users/resend-otp/', body);
        }
    };
    AuthService = __decorate([
        Injectable({
            providedIn: 'root'
        })
    ], AuthService);
    return AuthService;
})();
export { AuthService };
//# sourceMappingURL=auth.service.js.map