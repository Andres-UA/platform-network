import { Context, Contract } from 'fabric-contract-api';
import { Car } from './car';
import { ModelBase } from './model-base';

export class BaseContract extends Contract {
    public async initLedger(ctx: Context) {
        console.info('============= START : Initialize Ledger ===========');
        const baseModels: ModelBase[] = [
            {
                data: {
                    nombre: 'test',
                },
                docId: 'ADSF',
                srvId: '015',
            },
        ];

        for (let i = 0; i < baseModels.length; i++) {
            await ctx.stub.putState(
                'OBJ' + i,
                Buffer.from(JSON.stringify(baseModels[i])),
            );
            console.info('Added <--> ', baseModels[i]);
        }
        console.info('============= END : Initialize Ledger ===========');
    }

    public async getModelByID(ctx: Context, docId: string): Promise<string> {
        const modelAsBytes = await ctx.stub.getState(docId);
        if (!modelAsBytes || modelAsBytes.length === 0) {
            throw new Error(`Model with ${docId} does not exist`);
        }
        console.log(modelAsBytes.toString());
        return modelAsBytes.toString();
    }

    public async createModel(
        ctx: Context,
        serviceId: string,
        documentId: string,
        data: string,
    ) {
        const newModel: object = JSON.parse(data);
        const model: ModelBase = {
            data: newModel,
            docId: documentId,
            srvId: serviceId,
        };
        const newId = documentId;
        await ctx.stub.putState(newId, Buffer.from(JSON.stringify(model)));
    }

    public async getAllModels(
        ctx: Context,
        serviceId: string,
    ): Promise<string> {
        const modelAsBytes = await ctx.stub.getState(serviceId);
        if (!modelAsBytes || modelAsBytes.length === 0) {
            throw new Error(`Model with ${serviceId} does not exist`);
        }
        console.log(modelAsBytes.toString());
        return modelAsBytes.toString();
    }

    public async queryAllCars(
        ctx: Context,
        serviceId: string,
    ): Promise<string> {
        const startKey = serviceId + '0';
        const endKey = serviceId + '999999999999999999999';

        const iterator = await ctx.stub.getStateByRange(startKey, endKey);
        const allResults = [];
        while (true) {
            const res = await iterator.next();

            if (res.value && res.value.value.toString()) {
                console.log(res.value.value.toString('utf8'));

                const Key = res.value.key;
                let Record;
                try {
                    Record = JSON.parse(res.value.value.toString('utf8'));
                } catch (err) {
                    console.log(err);
                    Record = res.value.value.toString('utf8');
                }
                allResults.push({ Key: '1234567', Record: 'ID:' + Record.srvId });
                if (Record.srvId === serviceId) {
                    allResults.push({ Key, Record });
                }
            }
            if (res.done) {
                console.log('end of data');
                await iterator.close();
                console.info(allResults);
                return JSON.stringify(allResults);
            }
        }
    }

    public async updateStateModel(
        ctx: Context,
        docId: string,
        newModel: string,
    ) {
        const modelAsBytes = await ctx.stub.getState(docId); // get the car from chaincode state
        if (!modelAsBytes || modelAsBytes.length === 0) {
            throw new Error(`${docId} does not exist`);
        }
        const model: ModelBase = JSON.parse(modelAsBytes.toString());
        model.data = JSON.parse(newModel);
        await ctx.stub.putState(docId, Buffer.from(JSON.stringify(model)));
    }
}
