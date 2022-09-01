//---------------------------
//For an input size of 1 million numbers, Array. map() takes about 2,000ms, whereas a for loop takes about 250ms

function filterRating(filteredComments, rating) {
    if (rating === 0) return filteredComments;
    const filtered = [];
    for (let i = 0; i < filteredComments.length; i++) {
        const comment = filteredComments.comments[i];
        if (comment.content.rating === rating) filtered.push(comment);
    }
    // console.log(filtered);
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
    if (prop == 'none') return arr;

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

module.exports = {
    filterRating,
    filterConfirmed,
    sortComments,
};
