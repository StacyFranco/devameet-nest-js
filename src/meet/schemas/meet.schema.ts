import { Schema,Prop, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import { User } from "src/user/schemas/user.schema";
import { MeetObject, MeetObjectSchema } from "./meetObject.schema";

export type MeetDocument = HydratedDocument<Meet>;

@Schema()
export class Meet{
    @Prop({type: mongoose.Schema.Types.ObjectId, ref: 'User'})
    user: User;

    @Prop({required: true})
    name:string;

    @Prop({required: true})
    color: string;

    @Prop({required: true})
    link:string;

    @Prop({type: [MeetObjectSchema]})
    objects: MeetObject[];
}

export const MeetSchema = SchemaFactory.createForClass(Meet);