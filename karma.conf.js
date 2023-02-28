{
    "$schema": "./node_modules/@angular/cli/lib/config/schema.json",
    "version": 1,
    "newProjectRoot": "projects",
    "projects": {
        "afzaz": {
            "projectType": "application",
            "schematics": {
                "@schematics/angular:component": {
                    "prefix": "kt",
                    "style": "scss"
                },
                "@schematics/angular:directive": {
                    "prefix": "kt"
                }
            },
            "root": "",
            "sourceRoot": "src",
            "prefix": "app",
            "architect": {
                "build": {
                    "builder": "@angular-devkit/build-angular:browser",
                    "options": {
                        "allowedCommonJsDependencies": [
                                "lodash",
                                "rxjs-compat",
                                "@ks89/angular-modal-gallery",
                                "@ckeditor/ckeditor5-build-classic",
                                "clone-deep",
                                "dropzone",
                                "leaflet",
                                "feather-icons",