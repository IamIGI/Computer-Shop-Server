import { Request, Response } from 'express';
import { ContactInfoDocument } from '../model/generalData/contactInfo';
import { DeliveryPricesDocument } from '../model/generalData/deliveryPrices';
import generalDataServices from '../services/generalData.services';

const getGeneralData = async (req: Request, res: Response) => {
    console.log(`${req.originalUrl}`);
    const type = req.params.type;
    console.log(type);

    async function getData(type: string): Promise<DeliveryPricesDocument | ContactInfoDocument | Response> {
        switch (type) {
            case 'DeliveryPrices':
                return (await generalDataServices.getDeliveryPrices()) as DeliveryPricesDocument;
            case 'ContactInfo':
                return (await generalDataServices.getContactInfo()) as ContactInfoDocument;
            default:
                return res.status(406).json({ err: 'bad data name' });
        }
    }

    const data = await getData(type);
    if ('data' in data) {
        return res.status(200).json(data.data);
    }
};

export default { getGeneralData };
