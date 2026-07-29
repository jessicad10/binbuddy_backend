import { RecycleCenterModel, IRecycleCenter } from "../models/recycle-center.model";

export class RecycleCenterMongoRepository {
  async create(data: Partial<IRecycleCenter>): Promise<IRecycleCenter> {
    return await RecycleCenterModel.create(data);
  }

  async getAll(filters: { status?: string } = {}): Promise<IRecycleCenter[]> {
    const query: any = {};
    if (filters.status) {
      query.status = filters.status;
    }
    return await RecycleCenterModel.find(query).sort({ name: 1 });
  }

  async getById(id: string): Promise<IRecycleCenter | null> {
    return await RecycleCenterModel.findById(id);
  }

  async update(id: string, data: Partial<IRecycleCenter>): Promise<IRecycleCenter | null> {
    return await RecycleCenterModel.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: string): Promise<boolean> {
    const result = await RecycleCenterModel.findByIdAndDelete(id);
    return !!result;
  }
}
