"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const generalData_services_1 = __importDefault(require("../services/generalData.services"));
const getGeneralData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`${req.originalUrl}`);
    const type = req.params.type;
    console.log(type);
    function getData(type) {
        return __awaiter(this, void 0, void 0, function* () {
            switch (type) {
                case 'DeliveryPrices':
                    return (yield generalData_services_1.default.getDeliveryPrices());
                case 'ContactInfo':
                    return (yield generalData_services_1.default.getContactInfo());
                default:
                    return res.status(406).json({ err: 'bad data name' });
            }
        });
    }
    const data = yield getData(type);
    if ('data' in data) {
        return res.status(200).json(data.data);
    }
});
exports.default = { getGeneralData };
