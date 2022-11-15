import path from 'path';
import fs from 'fs';

const getUsersProductImages = (productId: string): string[] => {
    let urlArray: string[] = [];
    let fileName: string[] = []; // there was change from string to array ' = '' -> = []'
    let imagePath: string = '';

    const targetPath = path.join(__dirname, `../../files/comments/${productId}/`);
    if (!fs.existsSync(targetPath)) return urlArray;

    const dirInProduct = fs.readdirSync(targetPath);
    for (let i = 0; i < dirInProduct.length; i++) {
        fileName = fs.readdirSync(`${targetPath}/${dirInProduct[i]}`);
        imagePath = `comments/${productId}/${dirInProduct[i]}/${fileName[0]}`;
        urlArray.push(imagePath);
    }

    return urlArray;
};

export default getUsersProductImages;
