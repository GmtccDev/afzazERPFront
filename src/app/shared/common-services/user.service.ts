import { Injectable } from "@angular/core";
import { Router } from "@angular/router";

@Injectable({
    providedIn: 'root'
})
export class UserService {
    constructor(
        private router: Router
    ) { }
    getCurrentSystemLanguage(): string {
      
        let language = localStorage.getItem('language');
        if (language) return language;
        else {
            localStorage.setItem('language', 'en');
            return 'en';
        }
    }
    setLanguage(language: string) {
        localStorage.setItem('language', language)
    }
    isLoggedIn(): boolean {
        let token = localStorage.getItem('token');
        let refreshToken = localStorage.getItem('refreshToken');
        if (token) return true;

        return false;
    }
    setToken(token: string) {
        localStorage.setItem('token', token);
    }
    setRefreshToken(token: string) {
        localStorage.setItem('refreshToken', token);
    }
    getToken(): string | null {
        return localStorage.getItem('token');
    }
    getRefreshToken(): string | null {
        return localStorage.getItem('refreshToken');
    }
    removeToken() {
        localStorage.removeItem('token');
    }
    removeRefreshToken() {
        localStorage.removeItem('refreshToken');
    }
    logout() {
        this.removeToken();
        this.removeRefreshToken();
        this.router.navigate(['/authentication/login'])
    }
  
    setProfileImage(imageUrl: string) {
        if (imageUrl) {
            localStorage.setItem('profileImageUrl', imageUrl);
        }
    }
    getProfileImage(): string {
        let image = localStorage.getItem('profileImageUrl');
        if (image) return image;
        else return '';
    }
    setUserName(name: string) {
        if (name) {
            localStorage.setItem('userName', name);
        }
    }
    getUserName(){
        let name = localStorage.getItem('userName');
        if(name)return name;
        else return '';
    }

}