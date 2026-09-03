import { KeyboardEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SearchBar } from "../ui/SearchBar";

export function DashboardSearch({ placeholder = "Search procedures, documents or keywords…" }: { placeholder?: string }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  function submit() {
    if (search.trim()) navigate(`/procedures?search=${encodeURIComponent(search.trim())}`);
    else navigate("/procedures");
  }
  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) { if (event.key === "Enter") submit(); }
  return <div className="flex max-w-3xl gap-2"><SearchBar aria-label="Search procedures" className="flex-1" placeholder={placeholder} value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={onKeyDown} /><button type="button" onClick={submit} className="rounded-lg bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-600 focus-ring">Search</button></div>;
}
