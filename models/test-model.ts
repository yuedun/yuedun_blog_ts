import {Document, model, Model, Schema} from 'mongoose';

export var TestSchema: Schema = new Schema({
    title: String,
}, {timestamps: true});

export interface ITest extends Document {
    title: string;
    createdAt: Date;
    updatedAt: Date
}
var TestModel: Model<ITest> = model<ITest>('Test', TestSchema);

export default TestModel;