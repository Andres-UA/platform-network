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
            {
                data: {
                    nombre: 'test',
                },
                docId: 'ADSF1',
                srvId: '015s',
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
        console.info('============= START : Create Model ===========');

        const newModel: object = JSON.parse(data);

        const model: ModelBase = {
            data: newModel,
            docId: documentId,
            srvId: serviceId,
        };

        await ctx.stub.putState(documentId, Buffer.from(JSON.stringify(model)));
        console.info('============= END : Create Model ===========');
    }

    public async queryAllCars(ctx: Context): Promise<string> {
        const startKey = 'CAR0';
        const endKey = 'CAR999';

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
                allResults.push({ Key, Record });
            }
            if (res.done) {
                console.log('end of data');
                await iterator.close();
                console.info(allResults);
                return JSON.stringify(allResults);
            }
        }
    }

    public async updateStateModel(ctx: Context, docId: string, newModel: JSON) {
        console.info('============= START : changeCarOwner ===========');

        const modelAsBytes = await ctx.stub.getState(docId); // get the car from chaincode state
        if (!modelAsBytes || modelAsBytes.length === 0) {
            throw new Error(`${docId} does not exist`);
        }
        const model: ModelBase = JSON.parse(modelAsBytes.toString());
        model.data = newModel;

        await ctx.stub.putState(docId, Buffer.from(JSON.stringify(model)));
        console.info('============= END : changeCarOwner ===========');
    }

    public async changeCarOwner(
        ctx: Context,
        carNumber: string,
        newOwner: string,
    ) {
        console.info('============= START : changeCarOwner ===========');

        const carAsBytes = await ctx.stub.getState(carNumber); // get the car from chaincode state
        if (!carAsBytes || carAsBytes.length === 0) {
            throw new Error(`${carNumber} does not exist`);
        }
        const car: Car = JSON.parse(carAsBytes.toString());
        car.owner = newOwner;

        await ctx.stub.putState(carNumber, Buffer.from(JSON.stringify(car)));
        console.info('============= END : changeCarOwner ===========');
    }
}
