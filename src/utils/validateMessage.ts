import ForbiddenWords from '../model/ForbiddenWords';

/** check if message contain vulgar language */
async function validateMessage(message: string): Promise<boolean> {
    message = message.toLowerCase();
    const forbiddenWords = (await ForbiddenWords.find({}).exec())[0].forbiddenWords;
    for (let i = 0; i < forbiddenWords.length; i++) {
        if (message.includes(forbiddenWords[i])) {
            return true;
        }
    }
    return false;
}

export default validateMessage;
