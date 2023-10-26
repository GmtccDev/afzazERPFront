import { TranslateService } from '@ngx-translate/core';

import { CONTROLPANEL } from '../constants/constant';

export function selectLang(lang: string, translateService: TranslateService, type: string) {

    translateService.use(lang).subscribe(res=>{
      //console.log("Used Lang Setting is ",res);
    });
    localStorage.setItem("language", lang);
    let node = document.createElement('link');
    if (type == CONTROLPANEL || type=='control-panel') {
        node.href = '../assets/css/control-panel/style.css';
        node.rel = 'stylesheet';
        node.id = 'css-control-panel';
        document.getElementsByTagName('head')[0].appendChild(node);
    } else {

        if (lang == "ar") {
            //console.log("Arabic")
            localStorage.setItem("language", "ar");
             node.href = '../assets/website/css/style-ar.css';

        } else {
            //console.log("English")
            localStorage.setItem("language", "en");
             node.href = '../assets/website/css/style.css';

        }
        node.rel = 'stylesheet';
        node.id = 'css-theme';
        document.getElementsByTagName('head')[0].appendChild(node);


    }

}
