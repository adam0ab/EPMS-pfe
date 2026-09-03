import { useState } from "react";
import { ProcedureDTO, ProcedureStatus, Role } from "@epms/shared";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";
import { TextArea } from "../ui/Field";
import { useApproveProcedure, useArchiveProcedure, useCreateRevision, usePublishProcedure, useRejectProcedure, useSubmitForReview } from "../../hooks/useProcedures";

type Action = "submit" | "approve" | "reject" | "publish" | "archive" | "revise";

const labels: Record<Action, string> = {
  submit: "Soumettre pour validation",
  approve: "Accepter la procédure",
  reject: "Refuser la procédure",
  publish: "Publier la procédure",
  archive: "Archiver la procédure",
  revise: "Créer une nouvelle révision",
};

export function WorkflowActions({ procedure, role, onModify }: { procedure: ProcedureDTO; role?: Role; onModify?: () => void }) {
  const [action, setAction] = useState<Action | null>(null);
  const [comment, setComment] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const submit = useSubmitForReview();
  const approve = useApproveProcedure();
  const reject = useRejectProcedure();
  const publish = usePublishProcedure();
  const archive = useArchiveProcedure();
  const revise = useCreateRevision();
  const isPending = submit.isPending || approve.isPending || reject.isPending || publish.isPending || archive.isPending || revise.isPending;

  const isAdmin = role === Role.SUPER_ADMIN;
  const isValidator = role === Role.VALIDATOR;
  const allowedAction: Action | null =
    isAdmin && procedure.status === ProcedureStatus.DRAFT ? "submit" :
    isValidator && procedure.status === ProcedureStatus.PENDING_REVIEW ? "approve" :
    isAdmin && procedure.status === ProcedureStatus.APPROVED ? "publish" :
    isAdmin && procedure.status === ProcedureStatus.PUBLISHED ? "archive" : null;

  function close() { setAction(null); setComment(""); }
  function success(message: string) { close(); setToast(message); window.setTimeout(() => setToast(null), 4000); }
  function execute() {
    if (!action) return;
    if (action === "submit") submit.mutate({ id: procedure._id, comment: comment || undefined }, { onSuccess: () => success("Procédure soumise pour validation."), onError: () => setToast("Impossible de soumettre la procédure.") });
    if (action === "approve") approve.mutate({ id: procedure._id, comment: comment || undefined }, { onSuccess: () => success("Procédure approuvée."), onError: () => setToast("Impossible d'approuver la procédure.") });
    if (action === "reject") reject.mutate({ id: procedure._id, comment }, { onSuccess: () => success("Procédure rejetée."), onError: () => setToast("Un commentaire est obligatoire pour le rejet.") });
    if (action === "publish") publish.mutate(procedure._id, { onSuccess: () => success("Procédure publiée."), onError: () => setToast("La procédure doit être approuvée avant publication.") });
    if (action === "archive") archive.mutate(procedure._id, { onSuccess: () => success("Procédure archivée."), onError: () => setToast("Impossible d'archiver la procédure.") });
    if (action === "revise") revise.mutate(procedure._id, { onSuccess: (data) => { success("Nouvelle révision créée."); onModify?.(); }, onError: () => setToast("Impossible de créer une révision.") });
  }

  return (
    <>
      {isAdmin && [ProcedureStatus.DRAFT, ProcedureStatus.REJECTED].includes(procedure.status) && onModify && <Button variant="ghost" onClick={onModify}>{procedure.status === ProcedureStatus.REJECTED ? "Modifier puis resoumettre" : "Modifier"}</Button>}
      {isAdmin && procedure.status === ProcedureStatus.PUBLISHED && <Button variant="ghost" onClick={() => setAction("revise")}>Créer une révision</Button>}
      {allowedAction && <Button variant="secondary" onClick={() => setAction(allowedAction)}>{labels[allowedAction]}</Button>}
      {isValidator && procedure.status === ProcedureStatus.PENDING_REVIEW && <Button variant="danger" onClick={() => setAction("reject")}>Refuser</Button>}
      <Modal open={Boolean(action)} onClose={close} title={action ? labels[action] : ""}>
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">Cette action est enregistrée dans l'historique de validation et notifie les personnes concernées.</p>
          {action === "reject" && <TextArea label="Motif du rejet" required value={comment} onChange={(event) => setComment(event.target.value)} />}
          {action === "submit" && <TextArea label="Commentaire (optionnel)" value={comment} onChange={(event) => setComment(event.target.value)} />}
          {action === "approve" && <TextArea label="Commentaire (optionnel)" value={comment} onChange={(event) => setComment(event.target.value)} />}
          <div className="flex justify-end gap-3"><Button variant="ghost" onClick={close}>Annuler</Button><Button variant={action === "reject" ? "danger" : "primary"} onClick={execute} disabled={isPending || (action === "reject" && !comment.trim())}>{isPending ? "Traitement…" : "Confirmer"}</Button></div>
        </div>
      </Modal>
      {toast && <div role="status" className="fixed bottom-5 right-5 z-[60] rounded-lg bg-secondary px-4 py-3 text-sm text-white shadow-lg">{toast}</div>}
    </>
  );
}
