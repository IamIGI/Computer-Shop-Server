//---------------------------
//For an input size of 1 million numbers, Array. map() takes about 2,000ms, whereas a for loop takes about 250ms
const Comments = require('../..//model/Comments');

function filterRating(filteredComments, rating) {
    if (rating === 0) return filteredComments;
    const filtered = [];
    for (let i = 0; i < filteredComments.length; i++) {
        const comment = filteredComments.comments[i];
        if (comment.content.rating === rating) filtered.push(comment);
    }
    return { comments: filtered, length: filtered.length };
}

function filterConfirmed(filteredComments, confirmed) {
    //0 - true, 1- false, 2 - mean "No filter"
    if (confirmed === 2) return filteredComments;

    console.log(confirmed);
    confirmed === 0 ? (confirmed = true) : (confirmed = false);
    console.log(confirmed);

    const filtered = [];
    for (let i = 0; i < filteredComments.length; i++) {
        const comment = filteredComments.comments[i];
        if (comment.confirmed === confirmed) filtered.push(comment);
    }
    return { comments: filtered, length: filtered.length };
}

function sortComments(arr, prop) {
    let reverse = false;
    if (prop[0] === '-') {
        reverse = true;
        prop = prop.substr(1);
    }

    prop = prop.split('.');
    var len = prop.length;

    arr.sort(function (a, b) {
        var i = 0;
        while (i < len) {
            a = a[prop[i]];
            b = b[prop[i]];
            i++;
        }
        if (a < b) {
            return 1;
        } else if (a > b) {
            return -1;
        } else {
            return 0;
        }
    });
    if (reverse) return arr.reverse();
    return arr;
}

async function getAverageScore(productId) {
    let averageScore = 0;
    let averageScore_Stars = 0;
    let averageScore_View = 0;
    let eachScore = [
        { number: 0, percentage: 0 },
        { number: 0, percentage: 0 },
        { number: 0, percentage: 0 },
        { number: 0, percentage: 0 },
        { number: 0, percentage: 0 },
        { number: 0, percentage: 0 },
    ];

    const productComments = await Comments.findOne({ productId }).exec();
    if (!productComments) return res.status(204).send({});
    const numberOfComments = productComments.comments.length;
    //get average score
    for (let i = 0; i < numberOfComments; i++) {
        let score = productComments.comments[i].content.rating;

        switch (score) {
            case 1:
                eachScore[0].number += 1;
                break;
            case 2:
                eachScore[1].number += 1;
                break;
            case 3:
                eachScore[2].number += 1;
                break;
            case 4:
                eachScore[3].number += 1;
                break;
            case 5:
                eachScore[4].number += 1;
                break;
            case 6:
                eachScore[5].number += 1;
                break;

            default:
                console.log('Bad score value given');
                return res.send('Bad score value given');
        }

        averageScore += productComments.comments[i].content.rating;
    }

    averageScore = averageScore / numberOfComments;
    averageScore_Stars = Math.round(averageScore);
    averageScore_View = Math.round(averageScore * 10) / 10;

    function getPercentage(score, number) {
        return (score / number) * 100;
    }
    for (var i = 0; i < eachScore.length; i++) {
        eachScore[i].percentage = parseInt(getPercentage(eachScore[i].number, numberOfComments).toFixed(2));
    }

    // console.log(eachScore[1].number);
    const data = { numberOfComments, averageScore_View, averageScore_Stars, eachScore };
    return data;
}

module.exports = {
    filterRating,
    filterConfirmed,
    sortComments,
    getAverageScore,
};
