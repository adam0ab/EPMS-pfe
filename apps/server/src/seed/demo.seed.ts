import { AuditAction, ChangeType, NotificationType, ProcedureStatus, Role, ValidationAction } from "@epms/shared";
import { AuditLogModel } from "../models/AuditLog.model";
import { CategoryModel } from "../models/Category.model";
import { DepartmentModel } from "../models/Department.model";
import { DocumentMetaModel } from "../models/Document.model";
import { NotificationModel } from "../models/Notification.model";
import { ProcedureModel } from "../models/Procedure.model";
import { ProcedureVersionModel } from "../models/ProcedureVersion.model";
import { UserModel } from "../models/User.model";
import { ValidationHistoryModel } from "../models/ValidationHistory.model";
import { hashPassword } from "../utils/password";

type Definition = { title: string; department: string; category: string; responsible: string; status: ProcedureStatus };

const statusPlan: ProcedureStatus[] = [
  ...Array(30).fill(ProcedureStatus.PUBLISHED),
  ...Array(5).fill(ProcedureStatus.DRAFT),
  ...Array(5).fill(ProcedureStatus.PENDING_REVIEW),
  ...Array(3).fill(ProcedureStatus.APPROVED),
  ...Array(4).fill(ProcedureStatus.REJECTED),
  ...Array(3).fill(ProcedureStatus.ARCHIVED),
];

const procedureBase: Omit<Definition, "status">[] = [
  ["Inscription administrative", "Academic Affairs", "Student Enrollment", "Service scolarité"],
  ["Réinscription annuelle", "Academic Affairs", "Annual Registration", "Service scolarité"],
  ["Réinscription après redoublement", "Academic Affairs", "Re-registration", "Service scolarité"],
  ["Demande de suspension d'études", "Academic Affairs", "Academic Suspension", "Direction des études"],
  ["Changement de spécialité", "Academic Affairs", "Major Change", "Direction des études"],
  ["Validation des crédits du semestre", "Academic Affairs", "Semester Validation", "Direction des études"],
  ["Demande de certificat de scolarité", "Administration", "Certificate Request", "Bureau des certificats"],
  ["Demande de relevé de notes", "Administration", "Transcript Request", "Bureau des certificats"],
  ["Duplicata de carte étudiant", "Administration", "Student Card Request", "Accueil administratif"],
  ["Traitement d'une réclamation administrative", "Administration", "Administrative Complaint", "Secrétariat général"],
  ["Inscription pédagogique aux modules", "Academic Affairs", "Annual Registration", "Direction des études"],
  ["Organisation des examens", "Examination Department", "Exam Planning", "Service des examens"],
  ["Affectation des surveillants", "Examination Department", "Invigilator Assignment", "Service des examens"],
  ["Gestion des absences aux examens", "Examination Department", "Attendance Control", "Service des examens"],
  ["Publication des résultats", "Examination Department", "Result Publication", "Jury des examens"],
  ["Demande de recours sur une note", "Academic Affairs", "Grade Appeal", "Direction des études"],
  ["Inscription à la session de rattrapage", "Academic Affairs", "Retake Exams", "Direction des études"],
  ["Demande de stage d'été", "Internship Office", "Internship Validation", "Bureau des stages"],
  ["Établissement d'une convention de stage", "Internship Office", "Internship Validation", "Bureau des stages"],
  ["Validation du rapport de stage", "Internship Office", "Internship Validation", "Coordinateur des stages"],
  ["Proposition de sujet PFE", "Academic Affairs", "PFE Validation", "Coordinateur PFE"],
  ["Affectation d'un encadrant PFE", "Academic Affairs", "PFE Validation", "Coordinateur PFE"],
  ["Validation du sujet PFE", "Academic Affairs", "PFE Validation", "Commission PFE"],
  ["Dépôt du rapport PFE", "Academic Affairs", "PFE Validation", "Coordinateur PFE"],
  ["Organisation de la soutenance PFE", "Academic Affairs", "Graduation Process", "Commission PFE"],
  ["Demande de congé du personnel", "Human Resources", "Leave Request", "Direction des ressources humaines"],
  ["Déclaration d'absence", "Human Resources", "Leave Request", "Direction des ressources humaines"],
  ["Demande d'autorisation exceptionnelle", "Human Resources", "Leave Request", "Direction des ressources humaines"],
  ["Demande de formation du personnel", "Human Resources", "Training Request", "Direction des ressources humaines"],
  ["Demande de matériel pédagogique", "Logistics", "Equipment Request", "Service logistique"],
  ["Réservation de salle", "Logistics", "Classroom Reservation", "Service logistique"],
  ["Demande de maintenance", "Facilities Management", "Infrastructure Maintenance", "Service technique"],
  ["Création d'un compte institutionnel", "IT Department", "User Account Creation", "Support informatique"],
  ["Réinitialisation du mot de passe", "IT Department", "Password Reset", "Support informatique"],
  ["Demande d'accès à une ressource numérique", "IT Department", "Access Management", "Support informatique"],
  ["Signalement d'un incident informatique", "IT Department", "Security Incident Reporting", "Support informatique"],
  ["Demande de licence logicielle", "IT Department", "Software Request", "Support informatique"],
  ["Demande de bourse d'excellence", "Student Affairs", "Scholarship Request", "Service vie étudiante"],
  ["Demande de remboursement des frais", "Finance", "Refund Request", "Service financier"],
  ["Plan de paiement échelonné", "Finance", "Installment Plan", "Service financier"],
  ["Demande d'achat interne", "Procurement", "Purchase Request", "Service achats"],
  ["Évaluation d'un fournisseur", "Purchasing", "Supplier Evaluation", "Service achats"],
  ["Audit interne qualité", "Quality Assurance", "Internal Audit", "Cellule qualité"],
  ["Revue de conformité académique", "Quality Assurance", "Compliance Review", "Cellule qualité"],
  ["Enquête de satisfaction étudiante", "Quality Assurance", "Satisfaction Surveys", "Cellule qualité"],
  ["Demande d'accès au bâtiment", "Security", "Building Access", "Service sécurité"],
  ["Consultation des archives", "Library", "Archive Consultation", "Bibliothèque"],
  ["Demande de mobilité internationale", "International Relations", "Transfer Request", "Service relations internationales"],
  ["Inscription à un projet de recherche", "Research", "Academic Appeal", "Direction de la recherche"],
  ["Gestion d'une action corrective", "Quality Assurance", "Corrective Action", "Cellule qualité"],
].map(([title, department, category, responsible]) => ({ title, department, category, responsible }));

const definitions = procedureBase.map((procedure, index) => ({ ...procedure, status: statusPlan[index] }));
const demoEmails = [
  "amina.khelifi@demo.esprit.tn", "walid.benamor@demo.esprit.tn", "mariem.trabelsi@demo.esprit.tn",
  "yassine.mansour@demo.esprit.tn", "nour.benali@demo.esprit.tn", "ahmed.bensalah@demo.esprit.tn",
  "salma.gharbi@demo.esprit.tn", "karim.jaziri@demo.esprit.tn", "ines.haddad@demo.esprit.tn",
  "rayen.mejri@demo.esprit.tn", "sarra.benayad@demo.esprit.tn", "adem.trabelsi@demo.esprit.tn",
  "lina.mansour@demo.esprit.tn", "youssef.benali@demo.esprit.tn", "farah.khelifi@demo.esprit.tn",
  "malek.gharbi@demo.esprit.tn", "rihem.jaziri@demo.esprit.tn", "aymen.haddad@demo.esprit.tn",
];
const legacyDemoEmails = ["employee@esprit.tn", "student@esprit.tn", "validator@esprit.tn"];

function daysFromNow(days: number): Date { const date = new Date(); date.setDate(date.getDate() + days); date.setHours(10, 0, 0, 0); return date; }
function dateAfter(date: Date, days: number): Date { const next = new Date(date); next.setDate(next.getDate() + days); return next; }
function professionalSteps(title: string, responsible: string) {
  return [
    `Consulter les critères d’éligibilité et le calendrier de « ${title} » dans le référentiel EPMS : https://epms.esprit.tn/procedures.`,
    `Télécharger et compléter le formulaire officiel, puis préparer les justificatifs demandés selon la checklist : https://epms.esprit.tn/documents.`,
    `Déposer un dossier complet via le portail https://epms.esprit.tn/ et vérifier la réception de l’accusé de dépôt dans l’espace personnel.`,
    `Le dossier est contrôlé par ${responsible} ; toute pièce manquante fait l’objet d’une demande de complément avec un délai de réponse communiqué au demandeur.`,
    `Consulter la décision dans EPMS, appliquer les éventuelles actions demandées et conserver la notification de clôture dans le dossier administratif.`,
  ].map((description, index) => ({ order: index + 1, description }));
}

export async function seedDemoData() {
  const existingDemoUsers = await UserModel.find({ email: { $in: [...demoEmails, ...legacyDemoEmails] } }).select("_id");
  const legacyAdmin = await UserModel.findOne({ email: "admin@esprit.tn" }).select("_id");
  const ownerIds = [...existingDemoUsers.map((user) => user._id), ...(legacyAdmin ? [legacyAdmin._id] : [])];
  const oldProcedureIds = ownerIds.length ? await ProcedureModel.find({ createdBy: { $in: ownerIds } }).distinct("_id") : [];

  if (oldProcedureIds.length) {
    await Promise.all([
      DocumentMetaModel.deleteMany({ procedure: { $in: oldProcedureIds } }),
      NotificationModel.deleteMany({ procedure: { $in: oldProcedureIds } }),
      ValidationHistoryModel.deleteMany({ procedureId: { $in: oldProcedureIds } }),
      ProcedureVersionModel.deleteMany({ procedureId: { $in: oldProcedureIds } }),
      AuditLogModel.deleteMany({ entityType: { $in: ["Procedure", "ProcedureVersion", "DocumentMeta"] }, entityId: { $in: oldProcedureIds } }),
      ProcedureModel.deleteMany({ _id: { $in: oldProcedureIds } }),
    ]);
  }
  await Promise.all([
    NotificationModel.deleteMany({ recipient: { $in: existingDemoUsers.map((user) => user._id) } }),
    AuditLogModel.deleteMany({ actor: { $in: existingDemoUsers.map((user) => user._id) } }),
    UserModel.deleteMany({ email: { $in: [...demoEmails, ...legacyDemoEmails] } }),
  ]);

  const departments = await DepartmentModel.find();
  const categories = await CategoryModel.find();
  const departmentByName = new Map(departments.map((department) => [department.name, department._id]));
  const categoryByName = new Map(categories.map((category) => [category.name, category._id]));
  if (definitions.some((item) => !departmentByName.has(item.department) || !categoryByName.has(item.category))) {
    throw new Error("Demo seed references a missing department or category.");
  }

  const passwordHash = await hashPassword("Demo@12345");
  const people = [
    ["Amina Khelifi (démo)", demoEmails[0], Role.SUPER_ADMIN, "Quality Assurance"],
    ["Walid Ben Amor (démo)", demoEmails[1], Role.VALIDATOR, "Quality Assurance"],
    ["Mariem Trabelsi (démo)", demoEmails[2], Role.VALIDATOR, "Academic Affairs"],
    ["Yassine Mansour (démo)", demoEmails[3], Role.EMPLOYEE, "Academic Affairs"],
    ["Nour Ben Ali (démo)", demoEmails[4], Role.EMPLOYEE, "Administration"],
    ["Ahmed Ben Salah (démo)", demoEmails[5], Role.EMPLOYEE, "IT Department"],
    ["Salma Gharbi (démo)", demoEmails[6], Role.EMPLOYEE, "Human Resources"],
    ["Karim Jaziri (démo)", demoEmails[7], Role.EMPLOYEE, "Finance"],
    ...demoEmails.slice(8).map((email, index) => [["Ines Haddad", "Rayen Mejri", "Sarra Ben Ayad", "Adem Trabelsi", "Lina Mansour", "Youssef Ben Ali", "Farah Khelifi", "Malek Gharbi", "Rihem Jaziri", "Aymen Haddad"][index] + " (démo)", email, Role.STUDENT, "Academic Affairs"] as const),
  ] as const;
  const users = await UserModel.insertMany(people.map(([fullName, email, role, department]) => ({ fullName, email, role, passwordHash, department: departmentByName.get(department), isActive: true })));
  const admin = users.find((user) => user.role === Role.SUPER_ADMIN)!;
  const validators = users.filter((user) => user.role === Role.VALIDATOR);
  const employeeCreators = users.filter((user) => user.role === Role.EMPLOYEE);

  const procedures = [];
  for (const [index, definition] of definitions.entries()) {
    const createdAt = daysFromNow(-89 + index * 1);
    const creator = employeeCreators[index % employeeCreators.length];
    const deadline = index % 5 === 0 ? daysFromNow(-3 - (index % 6)) : index % 5 === 1 ? daysFromNow(2 + (index % 5)) : undefined;
    const published = [ProcedureStatus.PUBLISHED, ProcedureStatus.ARCHIVED].includes(definition.status);
    const procedure = await ProcedureModel.create({
      title: definition.title, description: `Procédure de démonstration ESPRIT pour ${definition.title.toLowerCase()}. Elle précise les responsabilités, les pièces attendues et les délais de traitement.`,
      department: departmentByName.get(definition.department), category: categoryByName.get(definition.category),
      keywords: ["ESPRIT", "démonstration", definition.department.toLowerCase()], requiredDocuments: ["Formulaire de demande signé", "Pièce justificative si nécessaire"],
      steps: professionalSteps(definition.title, definition.responsible),
      responsiblePerson: definition.responsible, effectiveDate: createdAt, lastUpdate: dateAfter(createdAt, 2), versionNumber: "1.0", status: definition.status,
      createdBy: creator._id, viewCount: published ? 25 + ((index * 17) % 180) : index % 6,
      showInCalendar: index % 4 === 0, eventType: index % 4 === 0 ? "Échéance administrative" : undefined,
      startDate: index % 4 === 0 ? dateAfter(createdAt, 1) : undefined, endDate: index % 4 === 0 ? dateAfter(createdAt, 15) : undefined, deadline,
    });
    const submittedAt = dateAfter(createdAt, 1);
    const reviewedAt = dateAfter(createdAt, 2);
    const updates: Record<string, unknown> = { createdAt, updatedAt: definition.status === ProcedureStatus.DRAFT ? dateAfter(createdAt, 1) : reviewedAt };
    if (definition.status !== ProcedureStatus.DRAFT) { updates.submittedAt = submittedAt; updates.submittedBy = admin._id; }
    if ([ProcedureStatus.APPROVED, ProcedureStatus.PUBLISHED, ProcedureStatus.ARCHIVED].includes(definition.status)) { updates.approvedAt = reviewedAt; updates.approvedBy = validators[index % validators.length]._id; }
    if (definition.status === ProcedureStatus.REJECTED) { updates.rejectedAt = reviewedAt; updates.rejectedBy = validators[index % validators.length]._id; updates.lastValidationComment = ["Documents justificatifs manquants.", "La procédure nécessite une mise à jour.", "Informations incomplètes.", "Le responsable de la procédure doit être précisé."][index % 4]; }
    if (published) { updates.publishedAt = dateAfter(createdAt, 3); updates.publishedBy = admin._id; updates.updatedAt = definition.status === ProcedureStatus.ARCHIVED ? dateAfter(createdAt, 5) : dateAfter(createdAt, 3); }
    await ProcedureModel.collection.updateOne({ _id: procedure._id }, { $set: updates });
    procedures.push({ procedure, definition, creator, createdAt, submittedAt, reviewedAt });
  }

  const histories = procedures.flatMap(({ procedure, definition, creator, createdAt, submittedAt, reviewedAt }, index) => {
    const rows = [{ procedureId: procedure._id, action: ValidationAction.RETURNED_TO_DRAFT, actor: creator._id, comment: "Procédure créée comme brouillon.", createdAt }];
    if (definition.status !== ProcedureStatus.DRAFT) rows.push({ procedureId: procedure._id, action: ValidationAction.SUBMITTED, actor: admin._id, comment: "Soumise pour validation.", createdAt: submittedAt });
    if ([ProcedureStatus.APPROVED, ProcedureStatus.PUBLISHED, ProcedureStatus.ARCHIVED].includes(definition.status)) rows.push({ procedureId: procedure._id, action: ValidationAction.APPROVED, actor: validators[index % validators.length]._id, comment: "Validation conforme.", createdAt: reviewedAt });
    if (definition.status === ProcedureStatus.REJECTED) rows.push({ procedureId: procedure._id, action: ValidationAction.REJECTED, actor: validators[index % validators.length]._id, comment: "Informations incomplètes.", createdAt: reviewedAt });
    if ([ProcedureStatus.PUBLISHED, ProcedureStatus.ARCHIVED].includes(definition.status)) rows.push({ procedureId: procedure._id, action: ValidationAction.PUBLISHED, actor: admin._id, comment: "Procédure publiée.", createdAt: dateAfter(createdAt, 3) });
    if (definition.status === ProcedureStatus.ARCHIVED) rows.push({ procedureId: procedure._id, action: ValidationAction.ARCHIVED, actor: admin._id, comment: "Procédure archivée.", createdAt: dateAfter(createdAt, 5) });
    return rows;
  });
  await ValidationHistoryModel.insertMany(histories);

  const documented = procedures.filter((_, index) => index % 4 !== 3);
  await DocumentMetaModel.insertMany(documented.flatMap(({ procedure, creator, createdAt }, index) => Array.from({ length: 1 + (index % 3) }, (_, documentIndex) => ({ procedure: procedure._id, fileName: ["Formulaire", "Guide", "Modèle"][documentIndex] + `-${index + 1}.pdf`, mimeType: "application/pdf", sizeBytes: 45_000 + index * 1_250 + documentIndex * 500, uploadedBy: creator._id, createdAt: dateAfter(createdAt, documentIndex), updatedAt: dateAfter(createdAt, documentIndex) }))));

  // A small, varied version history makes the comparison screen useful in a demo.
  // The current procedure is the latest revision; snapshots preserve the prior wording.
  const versionPlans = ["1.1", "1.1", "1.2", "1.2", "1.3", "1.3", "1.0", "1.0"];
  const versioned = procedures.filter(({ definition }) => definition.status === ProcedureStatus.PUBLISHED).slice(0, versionPlans.length);
  const versionRows = [];
  for (const [{ procedure, creator, createdAt }, latestVersion] of versioned.map((item, index) => [item, versionPlans[index]] as const)) {
    const [, latestMinor] = latestVersion.split(".").map(Number);
    for (let minor = 0; minor <= latestMinor; minor += 1) {
      const versionNumber = `1.${minor}`;
      const isInitial = minor === 0;
      const stepsWithCorrection = [
        ...procedure.steps.slice(0, 3),
        { order: 4, description: "En cas de dossier incomplet, transmettre la demande de complément via https://epms.esprit.tn/ et laisser cinq jours ouvrés au demandeur pour régulariser." },
        ...procedure.steps.slice(3).map((step) => ({ ...step, order: step.order + 1 })),
      ];
      const revision = [
        {
          description: "Version initiale : traitement administratif avec dépôt au service responsable.",
          documents: procedure.requiredDocuments,
          steps: procedure.steps,
          keywords: procedure.keywords,
          change: "Version initiale publiée pour la démonstration.",
        },
        {
          description: "Révision du processus : le dépôt est désormais effectué en ligne et un contrôle de complétude est réalisé avant transmission au service responsable.",
          documents: [...procedure.requiredDocuments, "Accusé de dépôt en ligne"],
          steps: procedure.steps.map((step) => step.order === 3
            ? { ...step, description: `${step.description} Le dépôt dématérialisé est obligatoire à partir de cette version.` }
            : step),
          keywords: [...procedure.keywords, "dépôt en ligne", "contrôle de complétude"],
          change: "Passage au dépôt en ligne et ajout du contrôle de complétude.",
        },
        {
          description: "Révision du processus : une demande incomplète est retournée au demandeur, qui dispose de cinq jours ouvrés pour fournir les éléments manquants.",
          documents: [...procedure.requiredDocuments, "Accusé de dépôt en ligne", "Justificatif complémentaire selon le dossier"],
          steps: stepsWithCorrection,
          keywords: [...procedure.keywords, "dépôt en ligne", "dossier incomplet", "délai de correction"],
          change: "Ajout d'un délai de correction et d'une pièce justificative complémentaire.",
        },
        {
          description: "Révision du processus : la décision est tracée dans EPMS, notifiée automatiquement et le dossier final est archivé pour assurer son suivi.",
          documents: [...procedure.requiredDocuments, "Accusé de dépôt en ligne", "Justificatif complémentaire selon le dossier", "Décision ou validation du service"],
          steps: stepsWithCorrection.map((step) => step.order === 6
            ? { ...step, description: "Valider la décision, déclencher la notification automatique dans https://epms.esprit.tn/ et archiver le dossier final conformément aux règles de traçabilité." }
            : step),
          keywords: [...procedure.keywords, "dépôt en ligne", "dossier incomplet", "notification", "traçabilité"],
          change: "Ajout de la notification automatique et de l'archivage du dossier final.",
        },
      ][minor];
      versionRows.push({
        procedureId: procedure._id, versionNumber, title: procedure.title, description: `${procedure.description} ${revision.description}`,
        department: procedure.department, category: procedure.category, steps: revision.steps,
        keywords: revision.keywords, requiredDocuments: revision.documents, status: ProcedureStatus.PUBLISHED,
        createdBy: creator._id, changeType: ChangeType.MINOR,
        changeDescription: revision.change,
        createdAt: dateAfter(createdAt, 3 + minor),
      });
    }
    const current = versionRows[versionRows.length - 1];
    await ProcedureModel.updateOne({ _id: procedure._id }, {
      $set: { versionNumber: latestVersion, description: current.description, steps: current.steps, keywords: current.keywords, requiredDocuments: current.requiredDocuments, lastUpdate: current.createdAt },
    });
  }
  await ProcedureVersionModel.insertMany(versionRows);

  await AuditLogModel.insertMany(histories.filter((_, index) => index % 3 === 0).map((history) => ({ actor: history.actor, action: history.action === ValidationAction.SUBMITTED ? AuditAction.SUBMIT_REVIEW : history.action === ValidationAction.APPROVED ? AuditAction.APPROVE : history.action === ValidationAction.REJECTED ? AuditAction.REJECT : history.action === ValidationAction.PUBLISHED ? AuditAction.PUBLISH : AuditAction.CREATE, entityType: "Procedure", entityId: history.procedureId, metadata: { source: "demo-seed" }, createdAt: history.createdAt })));

  const counts = Object.fromEntries(await ProcedureModel.aggregate<{ _id: ProcedureStatus; count: number }>([{ $group: { _id: "$status", count: { $sum: 1 } } }] ).then((rows) => rows.map((row) => [row._id, row.count])));
  console.log(`[seed] demo cleanup: ${oldProcedureIds.length} legacy procedures and ${existingDemoUsers.length} demo users removed`);
  console.log(`[seed] Users created: ${users.length}; Procedures created: ${procedures.length}`);
  console.log(`[seed] Published: ${counts.published ?? 0}; Pending review: ${counts.pending_review ?? 0}; Draft: ${counts.draft ?? 0}; Approved: ${counts.approved ?? 0}; Rejected: ${counts.rejected ?? 0}; Archived: ${counts.archived ?? 0}`);
}
