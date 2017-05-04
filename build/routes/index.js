"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var Promise = require("bluebird");
var route_1 = require("../utils/route");
var Routes = (function () {
    function Routes() {
    }
    Routes.default = function (req) {
        console.log(">>>>>>>>>>>>>default");
        return Promise.resolve(">>>>>>>>>>>>>>>>>>>>>>>>default");
    };
    Routes.index = function (req, res, next) {
        console.log(">>>>>>>>>>>>>index");
        res.send(">>>>>>>>>>>>>>>>>>>>>>>>index");
    };
    return Routes;
}());
__decorate([
    route_1.newRoute({
        path: "/",
        method: "get"
    })
], Routes, "default", null);
__decorate([
    route_1.newRoute({
        path: "/index",
        method: "get"
    })
], Routes, "index", null);
exports.default = Routes;
//# sourceMappingURL=index.js.map