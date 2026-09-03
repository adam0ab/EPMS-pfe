import { useNavigate } from "react-router-dom";
import { CategoryDTO } from "@epms/shared";
import { Card } from "../ui/Card";

export function CategoryQuickAccess({ categories }: { categories: CategoryDTO[] }) {
  const navigate = useNavigate();
  return <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{categories.slice(0, 8).map((category) => <Card key={category._id} className="cursor-pointer p-4" onClick={() => navigate(`/procedures?category=${category._id}`)}><p className="font-medium text-secondary dark:text-white">{category.name}</p><p className="mt-1 text-xs text-slate-400">{category.group}</p></Card>)}</div>;
}
