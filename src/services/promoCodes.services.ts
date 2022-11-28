import PromoCodesModel from '../model/PromoCodes';

async function updatePromoCodes(category: string, product: string, code: string): Promise<object> {
    const documentId = '6384898726c34784116adace';
    console.log(category === 'products');
    let response: object;
    switch (category) {
        case 'general':
            response = await PromoCodesModel.updateOne(
                {
                    _id: documentId,
                },
                {
                    $push: { general: code },
                }
            );

            break;
        case 'delivery':
            response = await PromoCodesModel.updateOne(
                {
                    _id: documentId,
                },
                {
                    $push: { 'category.delivery': code },
                }
            );
            break;
        case 'products':
            switch (product) {
                case 'dell':
                    response = await PromoCodesModel.updateOne(
                        {
                            _id: documentId,
                        },
                        {
                            $push: { 'category.products.dell': code },
                        }
                    );

                    break;
                case 'msi':
                    response = await PromoCodesModel.updateOne(
                        {
                            _id: documentId,
                        },
                        {
                            $push: { 'category.products.msi': code },
                        }
                    );
                    break;
                case 'hp':
                    response = await PromoCodesModel.updateOne(
                        {
                            _id: documentId,
                        },
                        {
                            $push: { 'category.products.hp': code },
                        }
                    );
                    break;
                case 'asus':
                    response = await PromoCodesModel.updateOne(
                        {
                            _id: documentId,
                        },
                        {
                            $push: { 'category.products.asus': code },
                        }
                    );
                    break;
                case 'apple':
                    response = await PromoCodesModel.updateOne(
                        {
                            _id: documentId,
                        },
                        {
                            $push: { 'category.products.apple': code },
                        }
                    );
                    break;
                case 'microsoft':
                    response = await PromoCodesModel.updateOne(
                        {
                            _id: documentId,
                        },
                        {
                            $push: { 'category.products.microsoft': code },
                        }
                    );
                    break;
                case 'general':
                    response = await PromoCodesModel.updateOne(
                        {
                            _id: documentId,
                        },
                        {
                            $push: { 'category.products.general': code },
                        }
                    );
                    break;

                default:
                    response = { err: 'bad product key', message: 'given product do not exists' };
            }
            break;
        default:
            response = {
                err: 'bad category key',
                message: 'given category do not exists',
                category,
                isTrue: category === 'products',
            };
            console.log('given category do not exists');
    }

    await PromoCodesModel.updateOne(
        {
            _id: documentId,
        },
        {
            $push: { allCodes: code },
        }
    );

    return response!;
}

export default { updatePromoCodes };
