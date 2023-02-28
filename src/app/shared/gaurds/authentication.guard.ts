import { Injectable } from "@angular/core";
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from "@angular/router";
import { Observable } from "rxjs";
import { UserService } from "../common-services/user.service";

@Injectable({
    providedIn: 'root'
})
export class AuthenticationGuard implements CanActivate {

    constructor(
        private router: Router,
        private userService: UserService
    ) { }

    /**
     * Check if the user is logged in before calling http
     *
     * @param route
     * @param state
     * @returns {boolean}
     */
    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<boolean> | Promise<boolean> | boolean {
        if (this.userService.isLoggedIn()) {
            return true;
        }
        this.router.navigate(['/authentication/login']);
        return false;
    }
}