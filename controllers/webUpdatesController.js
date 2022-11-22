'use strict';
var __awaiter =
    (this && this.__awaiter) ||
    function (thisArg, _arguments, P, generator) {
        function adopt(value) {
            return value instanceof P
                ? value
                : new P(function (resolve) {
                      resolve(value);
                  });
        }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) {
                try {
                    step(generator.next(value));
                } catch (e) {
                    reject(e);
                }
            }
            function rejected(value) {
                try {
                    step(generator['throw'](value));
                } catch (e) {
                    reject(e);
                }
            }
            function step(result) {
                result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
            }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
var __importDefault =
    (this && this.__importDefault) ||
    function (mod) {
        return mod && mod.__esModule ? mod : { default: mod };
    };
Object.defineProperty(exports, '__esModule', { value: true });
const WebUpdates_1 = __importDefault(require('../model/WebUpdates'));
const format_1 = __importDefault(require('date-fns/format'));
const errorHandlers_1 = require('../middleware/errorHandlers');
const webUpdates_1 = __importDefault(require('../middleware/pdfCreator/webUpdates'));
const addNewUpdate = (req, res) =>
    __awaiter(void 0, void 0, void 0, function* () {
        console.log(`${req.originalUrl}`);
        const { version, changes } = req.body;
        const newUpdate = new WebUpdates_1.default({
            version,
            date: (0, format_1.default)(new Date(), 'yyyy.MM.dd'),
            changes,
        });
        try {
            yield newUpdate.save();
            console.log('Added new update register');
            return res
                .status(200)
                .json({ message: 'Added new update register', date: (0, format_1.default)(new Date(), 'yyyy.MM.dd') });
        } catch (err) {
            (0, errorHandlers_1.apiErrorHandler)(req, res, err);
        }
    });
const getAllUpdates = (req, res) =>
    __awaiter(void 0, void 0, void 0, function* () {
        console.log(`${req.originalUrl}`);
        try {
            const response = yield WebUpdates_1.default.find({}).lean();
            console.log('List of updates returned successfully');
            return res.status(200).json(response);
        } catch (err) {
            console.log(err);
            (0, errorHandlers_1.apiErrorHandler)(req, res, err);
        }
    });
const getPDF = (req, res, next) =>
    __awaiter(void 0, void 0, void 0, function* () {
        console.log(`${req.originalUrl}`);
        try {
            const response = yield WebUpdates_1.default.find({}).lean();
            const stream = res.writeHead(200, {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment;filename=UpdatesLogs.pdf`,
            });
            webUpdates_1.default.buildPDF(
                (chunk) => stream.write(chunk),
                () => stream.end(),
                response
            );
            console.log('Send update list (PDF) successfully');
        } catch (err) {
            (0, errorHandlers_1.apiErrorHandler)(req, res, err); //send products as a response
        }
    });
exports.default = { addNewUpdate, getAllUpdates, getPDF };
