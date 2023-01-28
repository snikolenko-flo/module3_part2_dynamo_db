"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const node_crypto_1 = __importDefault(require("node:crypto"));
const util_1 = __importDefault(require("util"));
const UserSchema = new mongoose_1.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    salt: { type: String, required: true },
});
UserSchema.pre('save', async function (next) {
    const crypt = util_1.default.promisify(node_crypto_1.default.pbkdf2);
    const hash = await crypt(this.password, this.salt, 1000, 64, 'sha512');
    this.password = hash.toString('hex');
    next();
});
UserSchema.methods.isValidPassword = async function (password) {
    const crypt = util_1.default.promisify(node_crypto_1.default.pbkdf2);
    const hash = await crypt(password, this.salt, 1000, 64, 'sha512');
    return this.password === hash.toString('hex');
};
exports.User = mongoose_1.default.model('User', UserSchema);
