import { useState } from "react";
import { ProcedureStatus, Role } from "@epms/shared";
import { Button } from "../ui/Button";
import { useAddToChecklist, useStudentChecklists } from "../../hooks/useStudentChecklists";

export function ChecklistButton({ procedureId, status, role }: { procedureId: string; status: ProcedureStatus; role?: Role }) {
  const { data: checklists = [] } = useStudentChecklists();
  const add = useAddToChecklist();
  const [feedback, setFeedback] = useState<string | null>(null);

  if (role !== Role.STUDENT || status !== ProcedureStatus.PUBLISHED) return null;

  const added = checklists.some((checklist) => checklist.procedure._id === procedureId);

  return (
    <div className="flex flex-col items-start gap-1" onClick={(event) => event.stopPropagation()}>
      <Button
        variant={added ? "ghost" : "secondary"}
        disabled={added || add.isPending}
        onClick={() => {
          setFeedback(null);
          add.mutate(procedureId, {
            onSuccess: () => setFeedback("Added to your checklist."),
            onError: () => setFeedback("Could not add this procedure. Please try again."),
          });
        }}
      >
        {added ? "✓ In My Checklist" : add.isPending ? "Adding..." : "+ Add to Checklist"}
      </Button>
      {feedback && (
        <p role={add.isError ? "alert" : "status"} className={add.isError ? "text-xs text-red-600" : "text-xs text-emerald-600"}>
          {feedback}
        </p>
      )}
    </div>
  );
}
