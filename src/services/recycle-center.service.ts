import { RecycleCenterMongoRepository } from "../repositories/recycle-center.repository";
import { IRecycleCenter } from "../models/recycle-center.model";
import { HttpException } from "../exception/http-exception";

const centerRepository = new RecycleCenterMongoRepository();

export class RecycleCenterService {
  async createCenter(centerData: any): Promise<IRecycleCenter> {
    const { name, city, address, phone, email, hours, acceptedWaste, description, status } = centerData;

    if (!name || !city || !address || !phone || !email || !hours || !acceptedWaste || !description) {
      throw new HttpException(400, "All fields are required");
    }

    const payload = {
      name,
      city,
      address,
      phone,
      email,
      hours,
      acceptedWaste: Array.isArray(acceptedWaste) ? acceptedWaste : [acceptedWaste],
      description,
      status: status || "active"
    };

    return await centerRepository.create(payload);
  }

  async getAllCenters(filters: { status?: string } = {}): Promise<IRecycleCenter[]> {
    return await centerRepository.getAll(filters);
  }

  async getCenterById(id: string): Promise<IRecycleCenter> {
    const center = await centerRepository.getById(id);
    if (!center) {
      throw new HttpException(404, "Recycling center not found");
    }
    return center;
  }

  async updateCenter(id: string, centerData: any): Promise<IRecycleCenter> {
    const center = await this.getCenterById(id);

    const { name, city, address, phone, email, hours, acceptedWaste, description, status } = centerData;

    const payload: Partial<IRecycleCenter> = {};
    if (name !== undefined) payload.name = name;
    if (city !== undefined) payload.city = city;
    if (address !== undefined) payload.address = address;
    if (phone !== undefined) payload.phone = phone;
    if (email !== undefined) payload.email = email;
    if (hours !== undefined) payload.hours = hours;
    if (acceptedWaste !== undefined) payload.acceptedWaste = Array.isArray(acceptedWaste) ? acceptedWaste : [acceptedWaste];
    if (description !== undefined) payload.description = description;
    if (status !== undefined) payload.status = status;

    const updated = await centerRepository.update(id, payload);
    if (!updated) {
      throw new HttpException(500, "Failed to update recycling center");
    }

    return updated;
  }

  async deleteCenter(id: string): Promise<boolean> {
    await this.getCenterById(id);
    const success = await centerRepository.delete(id);
    if (!success) {
      throw new HttpException(500, "Failed to delete recycling center");
    }
    return true;
  }
}
