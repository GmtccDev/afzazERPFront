// import {PipeTransform} from '@angular/core';

import { FormGroup } from "@angular/forms";



export function stringIsNullOrEmpty(item: string) {

    return !(item && item.toString().length > 0 && item != ' ');
}

export function TrimSpcialCharacter(item: string, char: string = ',') {
    const lastIndex = item.trim().lastIndexOf(char);
    if (lastIndex > 0) {
        return item.substring(0, lastIndex);
    }
    return item;
}


export function ObjectIsNotNullOrEmpty(item: object) {
    if (item) {
        const containProperties = Object.keys(item).length > 0;
        return containProperties;
    }
    return false;
}


export function convertDataURIToBinary(dataURI: string, BASE64_MARKER = ';base64,'): number[] {
    const base64Index = dataURI.indexOf(BASE64_MARKER) + BASE64_MARKER.length;
    const base64 = dataURI.substring(base64Index);
    const raw = window.atob(base64);
    const rawLength = raw.length;
    const array = new Uint8Array(new ArrayBuffer(rawLength));

    for (let i = 0; i < rawLength; i++) {
        array[i] = raw.charCodeAt(i);
    }

    return Array.from(array);
}



export function getIds(weekDaysOff: string): any[] {
    if (!stringIsNullOrEmpty(weekDaysOff)) {
        const ids = [];
       // weekDaysOff.split(',').forEach(i => { ids.push(+i.trim()); });
        return ids;
    }
    return [];
}


export function searchName(text: string,  data): any[] {
    return data.filter(item => {
      const term = text.toLowerCase();
      return item.name.toLowerCase().includes(term)
        //   || pipe.transform(country.area).includes(term)
        //   || pipe.transform(country.population).includes(term);
    });
  }

 export function refreshPaging(data:any[], pageSize, page) {
    //this.countries = COUNTRIES
      return data.map((item, i) => ({id: i + 1, ...item}))
      .slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize);
  }

