"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pdfkit_1 = __importDefault(require("pdfkit"));
const path_1 = __importDefault(require("path"));
const format_1 = __importDefault(require("date-fns/format"));
function getDeliveryCost(method) {
    const Prices = {
        deliveryMan: 14.99,
        atTheSalon: 0.0,
        locker: 8.99,
    };
    let cost;
    let nettoCost;
    let vatValue;
    let bruttoCost;
    switch (method) {
        case 'deliveryMan':
            cost = Prices.deliveryMan;
            nettoCost = Number((Prices.deliveryMan * 0.77).toFixed(2));
            vatValue = Number((Prices.deliveryMan - nettoCost).toFixed(2));
            bruttoCost = Prices.deliveryMan - vatValue;
            return { cost, nettoCost, vatValue, bruttoCost };
        case 'atTheSalon':
            return { cost: 0, nettoCost: 0, vatValue: 0, bruttoCost: 0 };
        case 'locker':
            cost = Prices.locker;
            nettoCost = Number((Prices.locker * 0.77).toFixed(2));
            vatValue = Number((Prices.locker - nettoCost).toFixed(2)); //dopytac - toFixed return string!!
            bruttoCost = Prices.locker - vatValue;
            return { cost, nettoCost, vatValue, bruttoCost };
        default:
            console.log({ Err: 'Missing Order Method' });
            break;
    }
}
function getDeliveryDescription(method) {
    switch (method) {
        case 'deliveryMan':
            return 'Usługa: wysyłka';
        case 'atTheSalon':
            return 'Odbiór w salonie';
        case 'locker':
            return 'Usługa: paczkomat';
        default:
            console.log({ Err: 'Missing Order Method' });
            break;
    }
}
function getDate(monthNumber) {
    let year = monthNumber.split('.')[0];
    let month = monthNumber.split('.')[1];
    let day = monthNumber.split('.')[2];
    let monthName = '';
    switch (month) {
        case '01':
            monthName = 'styczeń';
            break;
        case '02':
            monthName = 'luty';
            break;
        case '03':
            monthName = 'marzec';
            break;
        case '04':
            monthName = 'kwiecień';
            break;
        case '05':
            monthName = 'maj';
            break;
        case '06':
            monthName = 'czerwiec';
            break;
        case '07':
            monthName = 'lipiec';
            break;
        case '08':
            monthName = 'sierpień';
            break;
        case '09':
            monthName = 'wrzesień';
            break;
        case '10':
            monthName = 'październik';
            break;
        case '11':
            monthName = 'listopad';
            break;
        case '12':
            monthName = 'grudzień';
            break;
        default:
            console.log('Bad date given');
            break;
    }
    return `${year}.${monthName}.${day}`;
}
function getPaymentMethod(method) {
    switch (method) {
        case 'online':
            return 'Płatność online';
        case 'card':
            return 'Karta płatnicza online';
        case 'cash':
            return 'Przelew gotówkowy';
        case 'uponReceipt':
            return 'Przy odbiorze';
        case 'installment':
            return 'Raty';
        default:
            console.log({ Err: 'Missing Payment Method' });
            break;
    }
}
function buildPDF(dataCallback, endCallback, data) {
    const logoImage = path_1.default.join(__dirname, '../../public/img/logo.PNG');
    const robotoMedium = path_1.default.join(__dirname, '../../public/fonts/Roboto-Medium.ttf');
    const robotoRegular = path_1.default.join(__dirname, '../../public/fonts/Roboto-Regular.ttf');
    const doc = new pdfkit_1.default({ size: 'A4', margin: 0 }); //A4 (595.28 x 841.89)
    doc.on('data', dataCallback);
    doc.on('end', endCallback);
    doc.image(logoImage, 30, 40, { width: 180 });
    const sellerBuyerDetails = () => {
        //Company info
        doc.font(robotoRegular).fontSize(10).text(`ul. Niewidomego 69, 69-100 Kraków`, 400, 40);
        doc.font(robotoRegular).fontSize(10).text(`34 695 69 69`, 502, 55);
        doc.font(robotoRegular).fontSize(10).text('www.hotshoot.tk hotshoot@gmail.pl', 397, 70);
        doc.font(robotoRegular)
            .fontSize(10)
            .text(`Kraków, ${getDate((0, format_1.default)(new Date(), 'yyyy.MM.dd'))}`, 411, 85, { width: 150, align: 'right' });
        //Title
        doc.font(robotoMedium).fontSize(14).text(`DOKUMENT FAKTURY NR: ${data._id}`, 110, 115);
        //Seller details
        doc.font(robotoMedium).fontSize(10).text('Sprzedawca:', 30, 140);
        doc.font(robotoMedium).fontSize(10).text('HotShoot Sp. z.o.o', 30, 152);
        doc.font(robotoMedium).fontSize(10).text('ul. Niewidomego 69, 69-100 Kraków', 30, 164);
        doc.font(robotoMedium)
            .fontSize(10)
            .text('Rachunek: ING Bank Śląski S.A. Oddział w Krakowie nr 10 1000 1000 1000 1**0 1000 1000', 30, 176);
        doc.font(robotoMedium).fontSize(10).text('NIP: 9222201111', 30, 188);
        doc.font(robotoMedium).fontSize(10).text('NIP EU: PL9222201111', 140, 188);
        const recipientDetails = data.transactionInfo.recipientDetails;
        //Buyer details
        doc.font(robotoMedium).fontSize(10).text('Nabywca:', 30, 212);
        doc.font(robotoMedium).fontSize(10).text(`${recipientDetails.name}`, 30, 224);
        doc.font(robotoMedium)
            .fontSize(10)
            .text(`${recipientDetails.zipCode} ${recipientDetails.place}, ${recipientDetails.street}`, 30, 236);
        //Sale details
        doc.font(robotoRegular)
            .fontSize(10)
            .text(`Data sprzedaży: ${getDate(data.transactionInfo.date)}`, 30, 260);
        doc.font(robotoRegular)
            .fontSize(10)
            .text(`Sposób zapłaty: ${getPaymentMethod(data.transactionInfo.paymentMethod)}`, 30, 272);
        doc.font(robotoRegular)
            .fontSize(10)
            .text(`Termin płatności: ${getDate(data.transactionInfo.date)}`, 30, 284);
    };
    const createTable = () => {
        //Table
        doc.moveTo(30, 305).lineTo(570, 305).stroke();
        doc.moveTo(30, 331).lineTo(570, 331).stroke();
        //--------------outer vertical lines
        doc.moveTo(30, 305).lineTo(30, 331).stroke();
        doc.moveTo(570, 305).lineTo(570, 331).stroke();
        //--------------inner center vertical lines
        doc.moveTo(55, 305).lineTo(55, 331).stroke(); //l.p / nazwa towaru
        doc.moveTo(285, 305).lineTo(285, 331).stroke(); //Nazwa towaru / J.m.
        doc.moveTo(315, 305).lineTo(315, 331).stroke(); //J.m. / Il.
        doc.moveTo(345, 305).lineTo(345, 331).stroke(); //Il / cena j. brutto.
        doc.moveTo(395, 305).lineTo(395, 331).stroke(); //cena j. brutto / wartosc netto.
        doc.moveTo(442, 305).lineTo(442, 331).stroke(); // wartosc netto / VAT%.
        doc.moveTo(475, 305).lineTo(475, 331).stroke(); // 23% / Kw. VAT.
        doc.moveTo(525, 305).lineTo(525, 331).stroke(); // Kw. VAT / wartosc
    };
    sellerBuyerDetails();
    createTable();
    //generate table rows for products
    let tableEndPosition = 0;
    let numberOfUniqueOrderedProducts = data.products.length;
    const totalCost = Number(data.transactionInfo.price.toFixed(2));
    const products = data.products;
    for (var i = 0; i < numberOfUniqueOrderedProducts; i++) {
        const lineHeight = i * 13;
        const createProductRows = () => {
            //--------------outer vertical lines
            doc.moveTo(30, 331 + lineHeight)
                .lineTo(30, 344 + lineHeight)
                .stroke();
            doc.moveTo(570, 331 + lineHeight)
                .lineTo(570, 344 + lineHeight)
                .stroke();
            //--------------inner center vertical lines
            doc.moveTo(55, 331 + lineHeight)
                .lineTo(55, 344 + lineHeight)
                .stroke(); //l.p / nazwa towaru
            doc.moveTo(285, 331 + lineHeight)
                .lineTo(285, 344 + lineHeight)
                .stroke(); //Nazwa towaru / J.m.
            doc.moveTo(315, 331 + lineHeight)
                .lineTo(315, 344 + lineHeight)
                .stroke(); //J.m. / Il.
            doc.moveTo(345, 331 + lineHeight)
                .lineTo(345, 344 + lineHeight)
                .stroke(); //Il / cena j. brutto.
            doc.moveTo(395, 331 + lineHeight)
                .lineTo(395, 344 + lineHeight)
                .stroke(); //cena j. brutto / wartosc netto.
            doc.moveTo(442, 331 + lineHeight)
                .lineTo(442, 344 + lineHeight)
                .stroke(); // wartosc netto / VAT%.
            doc.moveTo(475, 331 + lineHeight)
                .lineTo(475, 344 + lineHeight)
                .stroke(); // 23% / Kw. VAT.
            doc.moveTo(525, 331 + lineHeight)
                .lineTo(525, 344 + lineHeight)
                .stroke(); // Kw. VAT / wartosc brutto
            //---------------Horizontal line
            doc.moveTo(30, 344 + lineHeight)
                .lineTo(570, 344 + lineHeight)
                .stroke();
            //---------------In total
            if (i === numberOfUniqueOrderedProducts - 1) {
                doc.moveTo(30, 331 + lineHeight + 13)
                    .lineTo(30, 344 + lineHeight + 13)
                    .stroke();
                doc.moveTo(570, 331 + lineHeight + 13)
                    .lineTo(570, 344 + lineHeight + 13)
                    .stroke();
                //--------------inner center vertical lines
                doc.moveTo(55, 331 + lineHeight + 13)
                    .lineTo(55, 344 + lineHeight + 13)
                    .stroke(); //l.p / nazwa towaru
                doc.moveTo(285, 331 + lineHeight + 13)
                    .lineTo(285, 344 + lineHeight + 13)
                    .stroke(); //Nazwa towaru / J.m.
                doc.moveTo(315, 331 + lineHeight + 13)
                    .lineTo(315, 344 + lineHeight + 13)
                    .stroke(); //J.m. / Il.
                doc.moveTo(345, 331 + lineHeight + 13)
                    .lineTo(345, 344 + lineHeight + 13)
                    .stroke(); //Il / cena j. brutto.
                doc.moveTo(395, 331 + lineHeight + 13)
                    .lineTo(395, 344 + lineHeight + 13)
                    .stroke(); //cena j. brutto / wartosc netto.
                doc.moveTo(442, 331 + lineHeight + 13)
                    .lineTo(442, 344 + lineHeight + 13)
                    .stroke(); // wartosc netto / VAT%.
                doc.moveTo(475, 331 + lineHeight + 13)
                    .lineTo(475, 344 + lineHeight + 13)
                    .stroke(); // 23% / Kw. VAT.
                doc.moveTo(525, 331 + lineHeight + 13)
                    .lineTo(525, 344 + lineHeight + 13)
                    .stroke(); // Kw. VAT / wartosc brutto
                //---------------Horizontal line
                doc.moveTo(30, 344 + lineHeight + 13)
                    .lineTo(570, 344 + lineHeight + 13)
                    .stroke();
                doc.moveTo(525, 331 + lineHeight + 26)
                    .lineTo(525, 344 + lineHeight + 26)
                    .stroke(); // Kw. VAT / wartosc
                doc.moveTo(570, 331 + lineHeight + 26)
                    .lineTo(570, 344 + lineHeight + 26)
                    .stroke();
                //---------------Horizontal line
                doc.moveTo(525, 344 + lineHeight + 26)
                    .lineTo(570, 344 + lineHeight + 26)
                    .stroke();
                doc.font(robotoRegular)
                    .fontSize(9)
                    .text(`${i + 2}`, 30, 333 + lineHeight + 13, { width: 25, align: 'center' });
                doc.font(robotoRegular)
                    .fontSize(9)
                    .text(`${getDeliveryDescription(data.transactionInfo.deliveryMethod)}`, 57, 333 + lineHeight + 13);
                doc.font(robotoRegular)
                    .fontSize(9)
                    .text('szt.', 285, 333 + lineHeight + 13, { width: 28, align: 'right' });
                doc.font(robotoRegular)
                    .fontSize(9)
                    .text(`1`, 317, 333 + lineHeight + 13, { width: 28, align: 'center' });
                doc.font(robotoRegular)
                    .fontSize(9)
                    .text(`${getDeliveryCost(data.transactionInfo.deliveryMethod).cost}`, 345, 333 + lineHeight + 13, {
                    width: 48,
                    align: 'right',
                });
                doc.font(robotoRegular)
                    .fontSize(9)
                    .text(`${getDeliveryCost(data.transactionInfo.deliveryMethod).nettoCost}`, 392, 333 + lineHeight + 13, { width: 48, align: 'right' });
                doc.font(robotoRegular)
                    .fontSize(9)
                    .text('23%', 442, 333 + lineHeight + 13, { width: 28, align: 'right' });
                doc.font(robotoRegular)
                    .fontSize(9)
                    .text(`${getDeliveryCost(data.transactionInfo.deliveryMethod).vatValue}`, 473, 333 + lineHeight + 13, { width: 48, align: 'right' });
                doc.font(robotoRegular)
                    .fontSize(9)
                    .text(`${getDeliveryCost(data.transactionInfo.deliveryMethod).cost}`, 525, 333 + lineHeight + 13, {
                    width: 43,
                    align: 'right',
                });
                doc.font(robotoRegular)
                    .fontSize(10)
                    .text('Ogółem:', 484, 344 + lineHeight + 14);
                doc.font(robotoRegular)
                    .fontSize(10)
                    .text(`${totalCost}`, 525, 344 + lineHeight + 14, { width: 43, align: 'right' });
                tableEndPosition = 344 + lineHeight + 26;
            }
        };
        const productData = () => {
            const nettoCost = Number((products[i].price * 0.77).toFixed(2));
            const vatValue = Number((products[i].price - nettoCost).toFixed(2));
            doc.font(robotoRegular)
                .fontSize(9)
                .text(`${i + 1}`, 30, 333 + lineHeight, { width: 25, align: 'center' });
            doc.font(robotoRegular)
                .fontSize(9)
                .text(`${products[i].name}`, 57, 333 + lineHeight);
            doc.font(robotoRegular)
                .fontSize(9)
                .text('szt.', 285, 333 + lineHeight, { width: 28, align: 'right' });
            doc.font(robotoRegular)
                .fontSize(9)
                .text(`${products[i].quantity}`, 317, 333 + lineHeight, { width: 28, align: 'center' });
            doc.font(robotoRegular)
                .fontSize(9)
                .text(`${products[i].price}`, 345, 333 + lineHeight, { width: 48, align: 'right' });
            doc.font(robotoRegular)
                .fontSize(9)
                .text(`${nettoCost}`, 392, 333 + lineHeight, { width: 48, align: 'right' });
            doc.font(robotoRegular)
                .fontSize(9)
                .text('23%', 442, 333 + lineHeight, { width: 28, align: 'right' });
            doc.font(robotoRegular)
                .fontSize(9)
                .text(`${vatValue}`, 473, 333 + lineHeight, { width: 48, align: 'right' });
            doc.font(robotoRegular)
                .fontSize(9)
                .text(`${products[i].price * products[i].quantity}`, 525, 333 + lineHeight, {
                width: 43,
                align: 'right',
            });
        };
        createProductRows();
        productData();
    }
    //Table details
    const tableDetailsDescription = () => {
        doc.font(robotoRegular).fontSize(10).text('L.p.', 35, 307);
        doc.font(robotoRegular).fontSize(10).text('Nazwa towaru / Usługi', 60, 307);
        doc.font(robotoRegular).fontSize(10).text('J.m.', 290, 307);
        doc.font(robotoRegular).fontSize(10).text('Il.', 333, 307);
        doc.font(robotoRegular).fontSize(10).text('Cena j.', 360, 307);
        doc.font(robotoRegular).fontSize(10).text('brutto', 361, 319);
        doc.font(robotoRegular).fontSize(10).text('Wartość', 402, 307);
        doc.font(robotoRegular).fontSize(10).text('netto', 416, 319);
        doc.font(robotoRegular).fontSize(10).text('VAT %', 445, 307);
        doc.font(robotoRegular).fontSize(10).text('Kw. VAT', 486, 307);
        doc.font(robotoRegular).fontSize(10).text('Wartość', 530, 307);
        doc.font(robotoRegular).fontSize(10).text('brutto', 541, 319);
    };
    //Sum Up
    const sumUpDetailsDescription = () => {
        doc.font(robotoRegular)
            .fontSize(10)
            .text('Stawka VAT', 229, tableEndPosition + 15, { width: 110, align: 'right' });
        doc.font(robotoRegular)
            .fontSize(10)
            .text('Wartość netto', 299, tableEndPosition + 15, { width: 110, align: 'right' });
        doc.font(robotoRegular)
            .fontSize(10)
            .text('Wartość VAT', 381, tableEndPosition + 15, { width: 110, align: 'right' });
        doc.font(robotoRegular)
            .fontSize(10)
            .text('Wartość brutto', 459, tableEndPosition + 15, { width: 110, align: 'right' });
    };
    tableDetailsDescription();
    sumUpDetailsDescription();
    //SumUp--------Values
    const sumUp = () => {
        doc.font(robotoRegular)
            .fontSize(10)
            .text('23%', 229, tableEndPosition + 30, { width: 110, align: 'right' });
        doc.font(robotoRegular)
            .fontSize(10)
            .text(`${(totalCost * 0.77).toFixed(2)}`, 299, tableEndPosition + 30, { width: 110, align: 'right' });
        doc.font(robotoRegular)
            .fontSize(10)
            .text(`${(totalCost * 0.23).toFixed(2)}`, 381, tableEndPosition + 30, { width: 110, align: 'right' });
        doc.font(robotoRegular)
            .fontSize(10)
            .text(`${totalCost}`, 459, tableEndPosition + 30, { width: 110, align: 'right' });
        //SumUp--------InTotal
        doc.moveTo(180, tableEndPosition + 42)
            .lineTo(570, tableEndPosition + 42)
            .fillAndStroke('gray');
        doc.font(robotoRegular)
            .fontSize(10)
            .fillColor('black')
            .text('Ogółem:', 229, tableEndPosition + 42, { width: 110, align: 'right' });
        doc.font(robotoRegular)
            .fontSize(10)
            .text(`${(totalCost * 0.77).toFixed(2)}`, 299, tableEndPosition + 42, { width: 110, align: 'right' });
        doc.font(robotoRegular)
            .fontSize(10)
            .text(`${(totalCost * 0.23).toFixed(2)}`, 381, tableEndPosition + 42, { width: 110, align: 'right' });
        doc.font(robotoRegular)
            .fontSize(10)
            .text(`${totalCost}`, 459, tableEndPosition + 42, { width: 110, align: 'right' });
        doc.moveTo(180, tableEndPosition + 55)
            .lineTo(570, tableEndPosition + 55)
            .fillAndStroke('gray');
        //Cost
        doc.font(robotoRegular)
            .fontSize(10)
            .fillColor('black')
            .text('Do zapłaty: ', 30, tableEndPosition + 70, { width: 70, align: 'left' });
        doc.font(robotoRegular)
            .fontSize(10)
            .text(`${totalCost} zł`, 100, tableEndPosition + 70);
        doc.font(robotoMedium)
            .fontSize(11)
            .text('Uwaga: Dokument faktury nie jest dokumentem prawdziwym i nie jest podstawą do odliczenia VAT.', 50, tableEndPosition + 100);
    };
    sumUp();
    doc.end();
}
exports.default = { buildPDF };
