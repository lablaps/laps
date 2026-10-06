import { request } from "@/lib/api";
import type { Lang } from "@/lib/i18n";

export const impactKinds = ["SCHOLARSHIP", "DOCTORAL_SCHOLARSHIP", "INTERNATIONAL", "CONTRIBUTION", "AWARD", "OTHER"] as const;
export type ImpactKind = typeof impactKinds[number];
export type ImpactText = { pt: string; en: string; fr: string };
export interface ImpactInput {
  kind: ImpactKind;
  occurredOn: string;
  title: ImpactText;
  outcome: ImpactText;
  contribution: ImpactText;
  role: ImpactText;
  organization: string;
  tools: string[];
  collaborators: string[];
  supervisors: string[];
  evidence: { title: string; url: string }[];
}
export interface Impact {
  id: string;
  memberId: string;
  memberName: string;
  memberSlug: string;
  details: ImpactInput;
  createdAt: string;
  updatedAt: string;
}
export interface ImpactPage { content: Impact[]; totalElements: number; totalPages: number; }
export type ImpactFilters = { memberId?: string; kind?: string; from?: string; to?: string; q?: string; page?: number };
export const impactApi = {
  list: (filters: ImpactFilters = {}) => {
    const params = new URLSearchParams({ size: "12" });
    Object.entries(filters).forEach(([key, value]) => { if (value !== undefined && value !== "") params.set(key, String(value)); });
    return request<ImpactPage>(`/api/v1/impacts?${params}`);
  },
  mine: (page: number) => request<ImpactPage>(`/api/v1/me/impacts?page=${page}&size=12`),
  save: (body: ImpactInput, id?: string) => request<Impact>(`/api/v1/me/impacts${id ? `/${id}` : ""}`, { method: id ? "PUT" : "POST", body }),
  remove: (id: string) => request<void>(`/api/v1/me/impacts/${id}`, { method: "DELETE" }),
};
export const impactText = (text: ImpactText, lang: Lang) => text[lang]?.trim() || text.pt;
export const impactCopy = {
  pt: {
    title: "Impactos", intro: "Bolsas, experiências e contribuições de quem faz o LAPS.",
    categories: ["Bolsa", "Bolsa de doutorado", "Experiência internacional", "Contribuição", "Prêmio ou reconhecimento", "Outro"],
    add: "Adicionar impacto", edit: "Editar", remove: "Remover", confirm: "Remover este impacto do seu perfil?", save: "Salvar impacto", cancel: "Cancelar", saving: "Salvando…",
    heading: "Título", date: "Data", kind: "Categoria", outcome: "O que você obteve / resultado", contribution: "O que você fez / contribuição", role: "Seu papel", organization: "Instituição ou organização",
    tools: "Ferramentas", toolsHint: "Uma por linha, até 10 ferramentas.", collaborators: "Pessoas que colaboraram", peopleHint: "Um nome por linha; inclua pessoas de fora do LAPS também.", supervisors: "Orientadores / supervisores", supervisorHint: "Opcional. Deixe vazio se não houve orientação ou supervisão.",
    evidence: "Artigos, projetos e outros links de apoio", linkTitle: "Título do link", url: "URL (http ou https)", addLink: "Adicionar link", removeLink: "Remover link",
    translations: "Idioma do conteúdo", translationHint: "Preencha os campos em português. As traduções em inglês e francês são opcionais; quando vazias, exibimos o português.",
    publicNotice: "Os registros salvos são públicos no seu perfil e na página Impactos.",
    empty: "Nenhum impacto registrado.", noResults: "Nenhum impacto encontrado com estes filtros.", loading: "Carregando impactos…", error: "Não foi possível carregar os impactos.", retry: "Tentar novamente", saveError: "Não foi possível salvar. Verifique os campos e tente novamente.", deleteError: "Não foi possível remover o impacto.",
    search: "Buscar título, ferramenta ou contribuição", all: "Todas as categorias", from: "De", to: "Até", filter: "Filtrar", previous: "Anterior", next: "Próxima", page: "Página", of: "de", results: "registros", locked: "Troque sua senha temporária para editar impactos.",
    invalid: "Preencha os quatro campos em português, escolha uma data válida (até hoje) e respeite os limites das listas e links.", toolLimit: "Use no máximo 10 ferramentas.", optional: "Opcional", noneSupervisors: "Sem orientação ou supervisão informada", browse: "Explorar todos os impactos",
  },
  en: {
    title: "Impact", intro: "Scholarships, experiences and contributions from the people behind LAPS.",
    categories: ["Scholarship", "Doctoral scholarship", "International experience", "Contribution", "Award or recognition", "Other"],
    add: "Add impact", edit: "Edit", remove: "Remove", confirm: "Remove this impact from your profile?", save: "Save impact", cancel: "Cancel", saving: "Saving…",
    heading: "Title", date: "Date", kind: "Category", outcome: "What you received / outcome", contribution: "What you did / contribution", role: "Your role", organization: "Institution or organization",
    tools: "Tools", toolsHint: "One per line, up to 10 tools.", collaborators: "Collaborators", peopleHint: "One name per line; people outside LAPS can be included too.", supervisors: "Advisors / supervisors", supervisorHint: "Optional. Leave empty if there was no advisor or supervisor.",
    evidence: "Articles, projects and supporting links", linkTitle: "Link title", url: "URL (http or https)", addLink: "Add link", removeLink: "Remove link",
    translations: "Content language", translationHint: "Complete the Portuguese fields. English and French translations are optional; empty translations fall back to Portuguese.",
    publicNotice: "Saved entries are public on your profile and the Impact page.",
    empty: "No impact entries yet.", noResults: "No impacts match these filters.", loading: "Loading impacts…", error: "Could not load impacts.", retry: "Try again", saveError: "Could not save. Check the fields and try again.", deleteError: "Could not remove this impact.",
    search: "Search title, tool or contribution", all: "All categories", from: "From", to: "To", filter: "Filter", previous: "Previous", next: "Next", page: "Page", of: "of", results: "entries", locked: "Change your temporary password to edit impacts.",
    invalid: "Complete all four Portuguese fields, choose a valid date (up to today), and respect the list and link limits.", toolLimit: "Use no more than 10 tools.", optional: "Optional", noneSupervisors: "No advisor or supervisor reported", browse: "Explore all impacts",
  },
  fr: {
    title: "Impacts", intro: "Bourses, expériences et contributions des personnes qui font le LAPS.",
    categories: ["Bourse", "Bourse de doctorat", "Expérience internationale", "Contribution", "Prix ou distinction", "Autre"],
    add: "Ajouter un impact", edit: "Modifier", remove: "Supprimer", confirm: "Supprimer cet impact de votre profil ?", save: "Enregistrer l’impact", cancel: "Annuler", saving: "Enregistrement…",
    heading: "Titre", date: "Date", kind: "Catégorie", outcome: "Ce que vous avez obtenu / résultat", contribution: "Ce que vous avez fait / contribution", role: "Votre rôle", organization: "Établissement ou organisation",
    tools: "Outils", toolsHint: "Un par ligne, jusqu’à 10 outils.", collaborators: "Collaborateurs", peopleHint: "Un nom par ligne ; les personnes extérieures au LAPS sont également acceptées.", supervisors: "Directeurs / superviseurs", supervisorHint: "Facultatif. Laissez vide en l’absence de direction ou de supervision.",
    evidence: "Articles, projets et liens justificatifs", linkTitle: "Titre du lien", url: "URL (http ou https)", addLink: "Ajouter un lien", removeLink: "Supprimer le lien",
    translations: "Langue du contenu", translationHint: "Remplissez les champs en portugais. Les traductions anglaises et françaises sont facultatives ; le portugais est affiché en leur absence.",
    publicNotice: "Les entrées enregistrées sont publiques sur votre profil et sur la page Impacts.",
    empty: "Aucun impact enregistré.", noResults: "Aucun impact ne correspond à ces filtres.", loading: "Chargement des impacts…", error: "Impossible de charger les impacts.", retry: "Réessayer", saveError: "Enregistrement impossible. Vérifiez les champs et réessayez.", deleteError: "Impossible de supprimer cet impact.",
    search: "Rechercher un titre, un outil ou une contribution", all: "Toutes les catégories", from: "Du", to: "Au", filter: "Filtrer", previous: "Précédente", next: "Suivante", page: "Page", of: "sur", results: "entrées", locked: "Changez votre mot de passe temporaire pour modifier les impacts.",
    invalid: "Remplissez les quatre champs en portugais, choisissez une date valide (jusqu’à aujourd’hui) et respectez les limites des listes et liens.", toolLimit: "Utilisez au maximum 10 outils.", optional: "Facultatif", noneSupervisors: "Aucune direction ou supervision déclarée", browse: "Explorer tous les impacts",
  },
};
