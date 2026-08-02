import { FilterQuery } from "mongoose";
import { ProcedureDocument, ProcedureModel } from "../models/Procedure.model";
import { BaseRepository } from "./base.repository";
import { ProcedureAudience, ProcedureStatus } from "@epms/shared";

export interface ProcedureSearchFilters {
  search?: string;
  department?: string;
  category?: string;
  keyword?: string;
  status?: string | string[];
  versionNumber?: string;
  effectiveFrom?: string;
  effectiveTo?: string;
  health?: string;
  targetAudience?: ProcedureAudience;
}

export class ProcedureRepository extends BaseRepository<ProcedureDocument> {
  constructor() {
    super(ProcedureModel);
  }

  buildFilterQuery(filters: ProcedureSearchFilters): FilterQuery<ProcedureDocument> {
    const query: FilterQuery<ProcedureDocument> = {};

    if (filters.search) {
      query.$or = [
        { title: { $regex: filters.search, $options: "i" } },
        { description: { $regex: filters.search, $options: "i" } },
        { keywords: { $regex: filters.search, $options: "i" } },
      ];
    }
    if (filters.department) query.department = filters.department;
    if (filters.category) query.category = filters.category;
    if (filters.status) {
      if (Array.isArray(filters.status)) {
        query.status = { $in: filters.status };
      } else {
        query.status = filters.status;
      }
    }
    if (filters.targetAudience) query.targetAudience = filters.targetAudience;
    if (filters.health) {
      switch (filters.health) {
        case "healthy":
          query.status = ProcedureStatus.PUBLISHED;
          break;
        case "at-risk":
          query.status = { $in: [ProcedureStatus.APPROVED, ProcedureStatus.PENDING_REVIEW] };
          break;
        case "critical":
          query.status = { $in: [ProcedureStatus.REJECTED, ProcedureStatus.DRAFT] };
          break;
        case "overdue":
          query.status = { $nin: [ProcedureStatus.PUBLISHED, ProcedureStatus.ARCHIVED] };
          query.deadline = { $lt: new Date() };
          break;
        case "upcoming-deadline":
          query.deadline = { $gte: new Date(), $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) };
          break;
      }
    }
    if (filters.versionNumber) query.versionNumber = filters.versionNumber;
    if (filters.keyword) query.keywords = { $regex: filters.keyword, $options: "i" };
    if (filters.effectiveFrom || filters.effectiveTo) {
      query.effectiveDate = {
        ...(filters.effectiveFrom ? { $gte: new Date(filters.effectiveFrom) } : {}),
        ...(filters.effectiveTo ? { $lte: new Date(filters.effectiveTo) } : {}),
      };
    }

    return query;
  }

  async paginate(filters: ProcedureSearchFilters, page: number, pageSize: number) {
    const query = this.buildFilterQuery(filters);
    const skip = (page - 1) * pageSize;

    const [items, total] = await Promise.all([
      this.model
        .find(query)
        .populate("department", "name")
        .populate("category", "name group")
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(pageSize),
      this.model.countDocuments(query),
    ]);

    return { items, total };
  }

  countByStatus(status: string) {
    return this.model.countDocuments({ status });
  }

  countByDepartmentId(departmentId: string) {
    return this.model.countDocuments({ department: departmentId });
  }

  countByCategoryId(categoryId: string) {
    return this.model.countDocuments({ category: categoryId });
  }

  countByStatuses() {
    return this.model.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $project: { _id: 0, status: "$_id", count: 1 } },
    ]);
  }

  recentlySubmitted(limit = 8) {
    return this.model
      .find({ status: "pending_review" })
      .populate("department", "name")
      .populate("category", "name group")
      .populate("createdBy", "fullName email")
      .sort({ submittedAt: -1, updatedAt: -1 })
      .limit(limit);
  }

  countByDepartment() {
    return this.model.aggregate([
      { $group: { _id: "$department", count: { $sum: 1 } } },
      { $lookup: { from: "departments", localField: "_id", foreignField: "_id", as: "department" } },
      { $unwind: "$department" },
      { $project: { _id: 0, department: "$department.name", count: 1 } },
      { $sort: { count: -1 } },
    ]);
  }

  countByCategory() {
    return this.model.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $lookup: { from: "categories", localField: "_id", foreignField: "_id", as: "category" } },
      { $unwind: "$category" },
      { $project: { _id: 0, category: "$category.name", group: "$category.group", count: 1 } },
      { $sort: { count: -1 } },
    ]);
  }

  recentlyUpdated(limit = 5) {
    return this.model
      .find()
      .populate("department", "name")
      .populate("category", "name")
      .sort({ updatedAt: -1 })
      .limit(limit);
  }

  findRelated(procedureId: string, departmentId: string, categoryId: string, keywords: string[], limit = 5, targetAudience?: ProcedureAudience) {
    return this.model
      .find({
        _id: { $ne: procedureId },
        status: "published",
        ...(targetAudience ? { targetAudience } : {}),
        $or: [
          { category: categoryId },
          { department: departmentId },
          ...(keywords.length ? [{ keywords: { $in: keywords } }] : []),
        ],
      })
      .populate("department", "name")
      .populate("category", "name")
      .sort({ viewCount: -1, updatedAt: -1 })
      .limit(limit);
  }

  mostViewed(limit = 10) {
    return this.model
      .find({ status: "published" })
      .populate("department", "name")
      .populate("category", "name")
      .sort({ viewCount: -1 })
      .limit(limit);
  }

  monthlyActivity(months = 6) {
    const since = new Date();
    since.setMonth(since.getMonth() - (months - 1));
    since.setDate(1);
    since.setHours(0, 0, 0, 0);

    return this.model.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          created: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);
  }

  allForReport(filter: FilterQuery<ProcedureDocument> = {}) {
    return this.model.find(filter).populate("department", "name").populate("category", "name group");
  }

  proceduresRequiringAttention(limit = 20) {
    const now = new Date();
    const upcoming = new Date(now);
    upcoming.setDate(now.getDate() + 7);

    return this.model
      .find({
        status: { $nin: [ProcedureStatus.PUBLISHED, ProcedureStatus.ARCHIVED] },
        $or: [
          { status: ProcedureStatus.PENDING_REVIEW },
          { status: ProcedureStatus.REJECTED },
          { status: ProcedureStatus.APPROVED },
          { deadline: { $lt: now } },
          { deadline: { $gte: now, $lte: upcoming } },
        ],
      })
      .populate("department", "name")
      .populate("category", "name group")
      .populate("createdBy", "fullName email")
      .sort({ deadline: 1, submittedAt: -1, updatedAt: -1 })
      .limit(limit);
  }
}

export const procedureRepository = new ProcedureRepository();
