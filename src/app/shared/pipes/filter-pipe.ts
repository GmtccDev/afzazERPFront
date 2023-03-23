import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "filter"
})
export class FilterPipe implements PipeTransform {
  transform(items: any[], searchText: string): any[] {
    if (!items) return [];
    if (!searchText) return items;
    
    // TODO: need to improve this filter
    // because at this moment, only filter by boatType
    var lang = localStorage.getItem("language");
    if (lang == "ar") {
     // var res = items.filter(item => item.screenNameAr.toLowerCase().indexOf(searchText) !== -1);
      var res =  items.filter(item => {
          return item.screenNameAr.toLowerCase().includes(searchText.toLowerCase());
        });
      return res;
    }
    else {
      var res =  items.filter(item => {
        return item.screenNameEn.toLowerCase().includes(searchText.toLowerCase());
      });
      return res;
    }

    // return items.filter(item => {
    //   return item.boatType.toLowerCase().includes(searchText.toLowerCase());
    // });
  }
}
