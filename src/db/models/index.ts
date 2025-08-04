import { z } from 'zod';
import { createModel, createSchema, type IBaseDocument } from '../base';

export const sampleZodSchema = z.object({
  _id: z.string().min(1, 'ID is required'),
  field1: z.string().min(1, { message: 'Field1 is required' }),
  field2: z.string().url({ message: 'Field2 must be a valid URL' }),
});

export const sampleCreateSchema = sampleZodSchema.pick({
  _id: true,
  field1: true,
  field2: true,
});

export type ISample = z.infer<typeof sampleZodSchema> & IBaseDocument;

const sampleSchema = createSchema<ISample>({
  _id: { type: String, required: true },
  field1: { type: String, required: true, unique: true },
  field2: { type: String, required: true },
});

export const SampleModel = createModel<ISample>('Sample', sampleSchema);
