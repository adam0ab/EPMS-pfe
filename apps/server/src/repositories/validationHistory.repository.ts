import { ValidationHistoryDocument, ValidationHistoryModel } from "../models/ValidationHistory.model";
import { BaseRepository } from "./base.repository";

export class ValidationHistoryRepository extends BaseRepository<ValidationHistoryDocument> {
  constructor() {
    super(ValidationHistoryModel);
  }

  findByProcedure(procedureId: string) {
    return this.model
      .find({ procedureId })
      .populate("actor", "fullName email role")
      .sort({ createdAt: 1 });
  }

  countByAction() {
    return this.model.aggregate([
      { $group: { _id: "$action", count: { $sum: 1 } } },
      { $project: { _id: 0, action: "$_id", count: 1 } },
    ]);
  }

  recent(limit = 8) {
    return this.model
      .find()
      .populate("actor", "fullName email role")
      .populate("procedureId", "title status")
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  recentByActor(actorId: string, limit = 8) {
    return this.model
      .find({ actor: actorId })
      .populate("actor", "fullName email role")
      .populate("procedureId", "title status")
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  workflowActivity(since: Date) {
    return this.model.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: { date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, action: "$action" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.date": 1, "_id.action": 1 } },
    ]);
  }
}

export const validationHistoryRepository = new ValidationHistoryRepository();
