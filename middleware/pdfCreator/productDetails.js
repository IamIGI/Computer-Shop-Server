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
const pdfkit_1 = __importDefault(require("pdfkit"));
const format_1 = __importDefault(require("date-fns/format"));
const axios_1 = __importDefault(require("axios"));
const path_1 = __importDefault(require("path"));
function fetchImage(src) {
    return __awaiter(this, void 0, void 0, function* () {
        const image = yield axios_1.default.get(src, {
            responseType: 'arraybuffer',
        });
        return image.data;
    });
}
function getPolishNames(name) {
    switch (name) {
        case 'processor':
            return 'Procesor';
        case 'ram':
            return 'Pamięć RAM';
        case 'disk':
            return 'Dysk';
        case 'screen_diagonal':
            return 'Przekątna ekranu';
        case 'resolution':
            return 'Rozdzielczość ekranu';
        case 'graphics_card':
            return 'Karta graficzna';
        case 'communication':
            return 'Komunikacja';
        case 'ports':
            return 'Porty';
        case 'battery_capacity':
            return 'Pojemność baterii';
        case 'color':
            return 'Kolor dominujący';
        case 'operating_system':
            return 'System operacyjny';
        case 'additional_information':
            return 'Dodatkowe informacje';
        case 'height':
            return 'Wysokość';
        case 'width':
            return 'Szerokość';
        case 'depth':
            return 'Długość';
        case 'weigth':
            return 'Waga';
        case 'supplied_accessories':
            return 'Dołączone akcesoria';
        case 'guarantees':
            return 'Gwarancja';
        case 'producent_code':
            return 'Kod producenta';
        case 'Xigi_code':
            return 'Kod sklepu';
        default:
            console.log('Given name is not in the collection');
            break;
    }
}
function tableRender(obj, lineHeight, fontType, doc) {
    const indentLineHeight = 15;
    const textPropertiesDesc = { width: 150, align: 'left' };
    const textPropertiesValue = {
        width: 350,
        align: 'left',
    };
    for (let i = 0; i < Object.keys(obj).length; i++) {
        //get row names
        doc.font(fontType)
            .fontSize(11)
            .text(getPolishNames(Object.keys(obj)[i]), 30, lineHeight, textPropertiesDesc);
        //get row values
        if (Object.keys(obj)[i] === 'height' || Object.keys(obj)[i] === 'width' || Object.keys(obj)[i] === 'depth') {
            doc.font(fontType)
                .fontSize(11)
                .text(`${Object.values(obj)[i].description} mm`, 180, lineHeight, textPropertiesValue);
        }
        else if (Object.keys(obj)[i] === 'weigth') {
            doc.font(fontType)
                .fontSize(11)
                .text(`${Object.values(obj)[i].description} kg`, 180, lineHeight, textPropertiesValue);
        }
        else {
            doc.font(fontType)
                .fontSize(11)
                .text(Object.values(obj)[i].description, 180, lineHeight, textPropertiesValue);
            if (Object.keys(obj)[i] === 'processor' && doc.widthOfString(Object.values(obj)[i].description) > 350) {
                lineHeight += 15;
            }
        }
        if (lineHeight >= 790 && lineHeight <= 841.89) {
            doc.addPage({ size: 'A4' });
            lineHeight = 10;
        }
        //render arrays
        // @ts-ignore
        if (obj[Object.keys(obj)[i]].length !== undefined) {
            // @ts-ignore
            for (let k = 0; k < obj[Object.keys(obj)[i]].length; k++) {
                if (Object.keys(obj)[i] === 'communication') {
                    doc.font(fontType)
                        .fontSize(11)
                        // @ts-ignore
                        .text(obj[Object.keys(obj)[i]][k]['com'], 180, lineHeight, textPropertiesValue);
                }
                else if (Object.keys(obj)[i] === 'ports') {
                    doc.font(fontType)
                        .fontSize(11)
                        // @ts-ignore
                        .text(obj[Object.keys(obj)[i]][k]['port'], 180, lineHeight, textPropertiesValue);
                }
                else if (Object.keys(obj)[i] === 'additional_information') {
                    doc.font(fontType)
                        .fontSize(11)
                        // @ts-ignore
                        .text(obj[Object.keys(obj)[i]][k]['info'], 180, lineHeight, textPropertiesValue);
                }
                lineHeight += indentLineHeight;
            }
            lineHeight += 5;
        }
        else {
            lineHeight += 20;
        }
    }
}
function buildPDF(dataCallback, endCallback, data) {
    return __awaiter(this, void 0, void 0, function* () {
        // const logoImage = './public/img/logo.PNG';
        console.log(__dirname);
        const logoImage = path_1.default.join(__dirname, '../../public/img/logo.PNG');
        const robotoMedium = path_1.default.join(__dirname, '../../public/fonts/Roboto-Medium.ttf');
        const robotoRegular = path_1.default.join(__dirname, '../../public/fonts/Roboto-Regular.ttf');
        const doc = new pdfkit_1.default({ size: 'A4', margin: 0 }); //A4 (595.28 x 841.89)
        doc.on('data', dataCallback);
        doc.on('end', endCallback);
        doc.image(logoImage, 20, 50, { width: 140 });
        doc.font(robotoRegular)
            .fontSize(10)
            .text(`${(0, format_1.default)(new Date(), 'yyyy.MM.dd')}                         ${data.name} - Sklep komputerowy - HotShoot.tk`, 45, 20);
        const productImage = yield fetchImage(data.prevImg);
        if (data.special_offer.mode) {
            const withoutPromoPrice = data.price + data.special_offer.price;
            doc.font(robotoMedium)
                .fontSize(13)
                .text(`${withoutPromoPrice} zł`, 222 + doc.widthOfString(`${data.price} zł`) + 10, 140, { strike: true });
        }
        doc.image(productImage, 30, 85, { width: 180 });
        doc.font(robotoMedium).fontSize(13).text(data.name, 222, 110);
        doc.font(robotoMedium).fontSize(13).text(`${data.price} zł`, 222, 140);
        doc.font(robotoRegular).fontSize(11).text(`Kod produktu: ${data._id}`, 222, 170);
        doc.font(robotoRegular).fontSize(11).text(`URL: https://hotshoot.tk/product/${data._id}`, 222, 200);
        doc.font(robotoMedium).fontSize(12).text('Specyfikacja produktu', 30, 250);
        const PS = data.specification;
        tableRender(PS, 270, robotoRegular, doc);
        doc.end();
    });
}
exports.default = { buildPDF };
