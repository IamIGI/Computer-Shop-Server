function getDateDiffInHours(a: Date, b: Date) {
    const _MS_PER_DAY = 1000 * 60 * 60;
    // Discard the time and time-zone information.
    const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate(), a.getHours());
    const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate(), b.getHours());
    return Math.floor((utc2 - utc1) / _MS_PER_DAY);
}

export default getDateDiffInHours;
