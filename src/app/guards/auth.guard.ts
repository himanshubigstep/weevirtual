import { Injectable } from "@angular/core";
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from "@angular/router";
import { Observable } from "rxjs";
import { map, take } from "rxjs/operators";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Router } from "@angular/router";
import { AuthService } from '../shared/services/auth.service';

@Injectable()

export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private http: HttpClient,
    private authService: AuthService
  ) { }
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {

    return this.authService.isLoggedIn.pipe(
      map((isLoggedIn: boolean) => {
        console.log("Entered Auth Guard");
        if (!isLoggedIn) {
          this.router.navigate(["/auth"], {
            queryParams: { returnUrl: state.url }
          });
          return false;
        }
        const currentUser = localStorage.getItem("currentUser");
        if (currentUser !== "") {
          const currentUserDetails = JSON.parse(localStorage.getItem("currentUser"));
          const isAccessable = true;
          if (!isAccessable) {

          }
        }
        return true;
      }));
  }
}
