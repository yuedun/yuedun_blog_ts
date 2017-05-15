"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var Promise = require("bluebird");
var Debug = require("debug");
var debug = Debug('yuedun:index');
var blog_model_1 = require("../models/blog-model");
var route_1 = require("../utils/route");
var Routes = (function () {
    function Routes() {
    }
    Routes.index = function (req) {
        return blog_model_1.default.findOne()
            .then(function (data) {
            console.log(JSON.stringify(data));
            return data;
        });
    };
    Routes.test1 = function (req, res, next) {
        console.log(">>>>>>>>>>>>>test1");
        return Promise.resolve(">>>>>>>>>>>>test");
    };
    Routes.test2 = function (req) {
        console.log(">>>>>>>>>>>>>index");
        return Promise.resolve(">>>>>>>>>>>>index");
    };
    return Routes;
}());
__decorate([
    route_1.route({
        json: true
    })
], Routes, "index", null);
__decorate([
    route_1.route({
        json: true
    })
], Routes, "test1", null);
__decorate([
    route_1.route({})
], Routes, "test2", null);
exports.default = Routes;
//# sourceMappingURL=index.js.map