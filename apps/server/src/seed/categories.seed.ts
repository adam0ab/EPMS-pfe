import { CATEGORY_GROUPS } from "@epms/shared";
import { CategoryModel } from "../models/Category.model";

export async function seedCategories() {
  const entries = Object.entries(CATEGORY_GROUPS).flatMap(([group, names]) =>
    names.map((name) => ({ name, group }))
  );

  const docs = await Promise.all(
    entries.map((entry) =>
      CategoryModel.findOneAndUpdate(entry, entry, { upsert: true, new: true })
    )
  );
  console.log(`[seed] ${docs.length} categories ready`);
  return docs;
}
