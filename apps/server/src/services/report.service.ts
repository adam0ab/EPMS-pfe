import { procedureRepository } from "../repositories/procedure.repository";
import { ApiError } from "../utils/ApiError";

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export type ReportType = "by-department" | "by-category" | "most-viewed" | "monthly-activity";

export interface ReportTable {
  title: string;
  columns: { header: string; key: string; width?: number }[];
  rows: Record<string, string | number>[];
}

async function buildByDepartment(): Promise<ReportTable> {
  const data = await procedureRepository.countByDepartment();
  return {
    title: "Procedures by Department",
    columns: [
      { header: "Department", key: "department", width: 260 },
      { header: "Procedures", key: "count", width: 120 },
    ],
    rows: data.map((d) => ({ department: d.department, count: d.count })),
  };
}

async function buildByCategory(): Promise<ReportTable> {
  const data = await procedureRepository.countByCategory();
  return {
    title: "Procedures by Category",
    columns: [
      { header: "Group", key: "group", width: 200 },
      { header: "Category", key: "category", width: 200 },
      { header: "Procedures", key: "count", width: 100 },
    ],
    rows: data.map((c) => ({ group: c.group, category: c.category, count: c.count })),
  };
}

async function buildMostViewed(): Promise<ReportTable> {
  const procedures = await procedureRepository.mostViewed(10);
  return {
    title: "Most Viewed Procedures",
    columns: [
      { header: "Title", key: "title", width: 220 },
      { header: "Department", key: "department", width: 160 },
      { header: "Category", key: "category", width: 160 },
      { header: "Views", key: "views", width: 80 },
    ],
    rows: procedures.map((p) => ({
      title: p.title,
      department: (p.department as unknown as { name?: string })?.name ?? "",
      category: (p.category as unknown as { name?: string })?.name ?? "",
      views: p.viewCount,
    })),
  };
}

async function buildMonthlyActivity(): Promise<ReportTable> {
  const data = await procedureRepository.monthlyActivity(6);
  return {
    title: "Monthly Activity (Procedures Created, Last 6 Months)",
    columns: [
      { header: "Month", key: "month", width: 160 },
      { header: "Procedures Created", key: "created", width: 160 },
    ],
    rows: data.map((d) => ({
      month: `${MONTH_NAMES[d._id.month - 1]} ${d._id.year}`,
      created: d.created,
    })),
  };
}

export const reportService = {
  async build(type: ReportType): Promise<ReportTable> {
    switch (type) {
      case "by-department":
        return buildByDepartment();
      case "by-category":
        return buildByCategory();
      case "most-viewed":
        return buildMostViewed();
      case "monthly-activity":
        return buildMonthlyActivity();
      default:
        throw ApiError.badRequest(`Unknown report type: ${type}`);
    }
  },
};
