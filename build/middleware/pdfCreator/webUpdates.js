"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pdfkit_1 = __importDefault(require("pdfkit"));
function countBreakLines(list, doc) {
    let lineBreaksCount = 0;
    for (let i = 0; i < list.length; i++) {
        if (doc.widthOfString(list[i]) > 200)
            lineBreaksCount += 1;
    }
    return lineBreaksCount;
}
function endPosition(data, doc) {
    let listPositions = [80];
    const maximalPositionBeforeNextPage = 640;
    for (let i = 0; i < data.length; i++) {
        const lists = data[i].changes;
        const numberOfAdded = lists.added.length;
        const numberOfFixes = lists.fixes.length;
        if (i === 0) {
            if (lists.added.length + countBreakLines(lists.added, doc) >
                lists.fixes.length + countBreakLines(lists.fixes, doc)) {
                listPositions.push(125 + numberOfAdded * 10 + 30 + countBreakLines(lists.added, doc) * 10);
            }
            else {
                listPositions.push(125 + numberOfFixes * 10 + 30 + countBreakLines(lists.fixes, doc) * 10);
            }
        }
        else {
            if (lists.added.length + countBreakLines(lists.added, doc) >
                lists.fixes.length + countBreakLines(lists.fixes, doc)) {
                let position = 50 + listPositions[i] + numberOfAdded * 10 + 30 + countBreakLines(lists.added, doc) * 10;
                if (position >= maximalPositionBeforeNextPage) {
                    listPositions[listPositions.length - 1] = 80;
                    listPositions.push(45 + listPositions[i] + numberOfAdded * 10 + 30 + countBreakLines(lists.added, doc) * 10);
                }
                else {
                    listPositions.push(position);
                }
            }
            else {
                let position = 50 + listPositions[i] + numberOfFixes * 10 + 30 + countBreakLines(lists.fixes, doc) * 10;
                if (position >= maximalPositionBeforeNextPage) {
                    listPositions[listPositions.length - 1] = 80;
                    listPositions.push(45 + listPositions[i] + numberOfFixes * 10 + 30 + countBreakLines(lists.fixes, doc) * 10);
                }
                else {
                    listPositions.push(position);
                }
            }
        }
    }
    return listPositions;
}
function buildPDF(dataCallback, endCallback, data) {
    data = data.reverse();
    const doc = new pdfkit_1.default({ size: 'A4' }); //A4 (595.28 x 841.89)
    doc.on('data', dataCallback);
    doc.on('end', endCallback);
    doc.fontSize(15).text('List of updates', 50, 50);
    doc.moveTo(40, 70).lineTo(555, 70).stroke();
    const listPositions = endPosition(data, doc);
    for (let i = 0; i < data.length; i++) {
        if (listPositions[i] === 80 && i !== 0) {
            doc.addPage({ size: 'A4' });
            doc.fontSize(15).text('List of updates', 50, 50);
            doc.moveTo(40, 70).lineTo(555, 70).stroke();
        }
        // doc.fontSize(10).text(`Pozycja: ${listPositions[i]}`, 50, listPositions[i] - 10);
        doc.font('Helvetica-Bold').fontSize(10).text(`Date: ${data[i].date}`, 50, listPositions[i]);
        doc.fontSize(10).text(`Version: ${data[i].version}`, 50, listPositions[i] + 10);
        doc.font('Helvetica')
            .fontSize(10)
            .text('Added:', 50, listPositions[i] + 30);
        doc.list(data[i].changes.added, 70, listPositions[i] + 45, {
            width: 200,
            align: 'left',
            listType: 'bullet',
            bulletRadius: 1.5,
        });
        doc.fontSize(10).text('Fixed:', 300, listPositions[i] + 30);
        doc.list(data[i].changes.fixes, 320, listPositions[i] + 45, {
            width: 200,
            align: 'left',
            listType: 'bullet',
            bulletRadius: 1.5,
        });
    }
    doc.end();
}
exports.default = { buildPDF };
