import { Injectable, OnInit, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import  auth  from 'firebase/compat/app';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { ToastrService } from 'ngx-toastr';
import { CookieService } from 'ngx-cookie-service';
import * as firebase from 'firebase/app';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  emailVerified: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnInit {

//   public userData: any;
//   public user: firebase.User;
    public showLoader: boolean = false;
    public userData: any; // Save logged in user data

  constructor(public afs: AngularFirestore,
    public afAuth: AngularFireAuth,
    public router: Router,
    public ngZone: NgZone,
    public toster: ToastrService,
    private cookieService: CookieService) {

      this.afAuth.authState.subscribe((user) => {
        console.log("call 36",user);
        if (user) {
          this.userData = user;
          localStorage.setItem('user', JSON.stringify(this.userData));
          JSON.parse(localStorage.getItem('user')!);
        } else {
          localStorage.setItem('user', 'null');
          JSON.parse(localStorage.getItem('user')!);
        }
      });
    // this.afAuth.authState.subscribe(user => {
    //   
      
    //   if (user) {
    //     this.userData = user;
    //     cookieService.set('user', JSON.stringify(this.userData));
    //     localStorage.setItem('user', JSON.stringify(this.userData));
    //     JSON.parse(localStorage.getItem('user'));
    //   } else {
    //     localStorage.setItem('user', null);
    //     JSON.parse(localStorage.getItem('user'));
    //   }
    // });
  }

  ngOnInit(): void {
    console.log("localstoregae",localStorage.getItem('user'));
    
   }

  // sign in function
  SignIn(email, password) {
    
    return this.afAuth.signInWithEmailAndPassword(email, password)
      .then((result) => {
        if (result.user.emailVerified !== true) {
          this.SetUserData(result.user);
          this.SendVerificationMail();
          this.showLoader = true;
          this.router.navigate(['/dashboard/default']);
          
        } else {
          this.showLoader = false;
          this.ngZone.run(() => {
            this.router.navigate(['/auth/login']);
          });
        }
      }).catch((error) => {
        this.toster.error('You have enter Wrong Email or Password.');
      })
  }

  // main verification function
  SendVerificationMail() {
    return this.afAuth.currentUser
    .then((user) => {
      return user.sendEmailVerification();
    })
    .then(() => {
      this.router.navigate(['verify-email-address']);
    });
  }

  // Sign in with Facebook
  // signInFacebok() {
  //   return this.AuthLogin(new auth.FacebookAuthProvider());
  // }

  // // Sign in with Twitter
  // signInTwitter() {
  //   return this.AuthLogin(new auth.TwitterAuthProvider());
  // }

  // // Sign in with Google
  // GoogleAuth() {
  //   return this.AuthLogin(new auth.GoogleAuthProvider()).then((res: any) => {
  //     if (res) {
  //       this.router.navigate(['dashboard']);
  //     }
  //   });
  // }

  AuthLogin(provider: any) {
    console.log("call fun 100");
    
    return this.afAuth
      .signInWithPopup(provider)
      .then((result) => {
        this.ngZone.run(() => {
          this.router.navigate(['dashboard/default']);
        });
        this.SetUserData(result.user);
      })
      .catch((error) => {
        window.alert(error);
      });
  }

  SetUserData(user: any) {
    const userRef: AngularFirestoreDocument<any> = this.afs.doc(
      `users/${user.uid}`
    );
    const userData: User = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
    };
    return userRef.set(userData, {
      merge: true,
    });
  }

  forgetPassword(passwordResetEmail) {
    return this.afAuth.sendPasswordResetEmail(passwordResetEmail)
      .then(() => {
        window.alert('Password reset email sent, check your inbox.');
      }).catch((error) => {
        window.alert(error);
      });
  }


  SignOut() {
    return this.afAuth.signOut().then(() => {
      // localStorage.clear();
      localStorage.removeItem('user');
      // this.cookieService.deleteAll('user', '/auth/login');
      this.router.navigate(['/auth/login']);
    });
  }

  get isLoggedIn(): boolean {
    const user = JSON.parse(localStorage.getItem('user'));
    return (user != null && user.emailVerified != false) ? true : false;
  }

}