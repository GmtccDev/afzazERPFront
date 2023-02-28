import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class SpinnerService {
    show() {
        let d = document.getElementById("loader");
        if(d){
          d.className += " show_loader";
        }
    }
    hide(){
        let d = document.getElementById("loader");
        if(d){
          d.className = "bg_loader";
        }
    }
}