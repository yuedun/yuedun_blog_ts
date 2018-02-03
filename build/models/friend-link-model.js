"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var FriendLinkSchema = new mongoose_1.Schema({
    url: { type: String, required: true },
    name: { type: String, required: true },
    state: { type: Number, required: true, default: 1 }
}, { validateBeforeSave: true, timestamps: true });
var FriendLinkModel = mongoose_1.model('FriendLink', FriendLinkSchema);
exports.default = FriendLinkModel;
//# sourceMappingURL=friend-link-model.js.map