"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.PointOfSaleComponent = void 0;
var core_1 = require("@angular/core");
var PointOfSaleComponent = /** @class */ (function () {
    function PointOfSaleComponent(router, fb, route) {
        this.router = router;
        this.fb = fb;
        this.route = route;
    }
    PointOfSaleComponent.prototype.ngOnInit = function () {
    };
    PointOfSaleComponent = __decorate([
        core_1.Component({
            selector: 'app-point-of-sale',
            templateUrl: './point-of-sale.component.html',
            styleUrls: ['./point-of-sale.component.scss']
        })
    ], PointOfSaleComponent);
    return PointOfSaleComponent;
}());
exports.PointOfSaleComponent = PointOfSaleComponent;
