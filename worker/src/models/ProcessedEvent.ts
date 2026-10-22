import mongoose, { Document, Schema } from 'mongoose';

export interface IProcessedEvent extends Document {
  eventId: string;
  eventType: string;
  processedAt: Date;
}

const ProcessedEventSchema = new Schema<IProcessedEvent>(
  {
    eventId: { type: String, required: true, unique: true, index: true },
    eventType: { type: String, required: true },
    processedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const ProcessedEvent = mongoose.model<IProcessedEvent>(
  'ProcessedEvent',
  ProcessedEventSchema
);
