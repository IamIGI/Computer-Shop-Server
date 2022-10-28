const path = require('path');
const fs = require('fs');

const getUsersProductImages = (productId) => {
    let urlArray = [];
    let fileName = '';
    let imagePath = '';

    const targetPath = path.join(__dirname, `../../files/comments/${productId}/`);
    if (!fs.existsSync(targetPath)) return urlArray;

    const dirInProduct = fs.readdirSync(targetPath);
    for (i = 0; i < dirInProduct.length; i++) {
        fileName = fs.readdirSync(`${targetPath}/${dirInProduct[i]}`);
        imagePath = `comments/${productId}/${dirInProduct[i]}/${fileName[0]}`;
        urlArray.push(imagePath);
    }

    return urlArray;
};

module.exports = getUsersProductImages;
