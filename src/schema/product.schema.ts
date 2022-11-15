import { object, string, TypeOf } from 'zod';

const params = {
    params: object({
        code: string({
            required_error: 'product code is required',
        }),
    }),
};

export const getProductSchema = object({
    ...params,
});

export const getProductPDFSchema = object({
    ...params,
});

export type readProductInput = TypeOf<typeof getProductSchema>;
export type readProductPDFInput = TypeOf<typeof getProductPDFSchema>;
