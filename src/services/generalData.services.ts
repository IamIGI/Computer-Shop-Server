import { ContactInfoDocument, ContactInfoModel } from '../model/generalData/contactInfo';
import { DeliveryPricesInput, DeliveryPricesModel } from '../model/generalData/deliveryPrices';

/** get delivery prices  */
async function getDeliveryPrices(): Promise<DeliveryPricesInput | undefined> {
    try {
        return (await DeliveryPricesModel.findOne({}).exec()) as DeliveryPricesInput;
    } catch (err) {
        console.log(err);
    }
}

/** get contact info  */
async function getContactInfo(): Promise<ContactInfoDocument | undefined> {
    try {
        return (await ContactInfoModel.findOne({}).exec()) as ContactInfoDocument;
    } catch (err) {
        console.log(err);
    }
}

export default { getDeliveryPrices, getContactInfo };
