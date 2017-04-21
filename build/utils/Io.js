"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var FS = require("fs");
var Path = require("path");
function listFiles(path, regex) {
    if (regex === void 0) { regex = /./; }
    var names = FS.readdirSync(path);
    var files = [];
    var dirs = [];
    for (var _i = 0, names_1 = names; _i < names_1.length; _i++) {
        var name = names_1[_i];
        var targetPath = Path.join(path, name);
        if (FS.statSync(targetPath).isFile()) {
            if (regex.test(targetPath)) {
                files.push(targetPath);
            }
        }
        else {
            dirs.push(targetPath);
        }
    }
    for (var _a = 0, dirs_1 = dirs; _a < dirs_1.length; _a++) {
        var dir = dirs_1[_a];
        files.push.apply(files, listFiles(dir, regex));
    }
    return files;
}
exports.listFiles = listFiles;
//# sourceMappingURL=Io.js.map