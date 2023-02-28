import { ActivatedRoute,Router } from "@angular/router";



export function getCurrentUrl() {

  return window.location.href;

}

export function getOriginUrl() {

  let currentUrl;
  currentUrl = window.location.origin;

  return currentUrl;

}

export function getTokenFromUrl() {

  // OR: If you want to use the current page's URL
  var url = window.location;
  var access_token = new URLSearchParams(url.search).get('code');
  return access_token
}
export function getDataFromUrl() {

  // OR: If you want to use the current page's URL
  var url = window.location;
  const data:any ={
    userId: new URLSearchParams(url.search).get('userId'),
    userEmail:new URLSearchParams(url.search).get('email'),
  }
  return data
}

export function tokenExpired(token: string) {
  const expiry = (JSON.parse(atob(token.split('.')[1]))).exp;
  return (Math.floor((new Date).getTime() / 1000)) >= expiry;
}


export function getParmasFromActiveUrl(route:ActivatedRoute)
{

  let params= route.snapshot.paramMap
    if(params!=null)
    {
      return params
    }
    return null;

}

export function getActivatedRoutePath(route:ActivatedRoute)
{

  let componentName= route?.snapshot?.firstChild?.routeConfig?.component?.name
    if(componentName!=null)
    {
      return componentName
    }
    return null;



}

export function navigateUrl(urlroute: string,route:Router) {
  route.navigate([urlroute]);
}


