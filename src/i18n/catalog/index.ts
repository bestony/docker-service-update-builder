import { SECTIONS } from "../../docker/catalog";
import type { FieldDef, SectionDef } from "../../docker/field-types";
import type { FieldCopyTable, SectionCopy } from "../field-copy";
import { applyFieldCopy, applySectionCopy } from "../field-copy";
import type { Locale } from "../locale";
import {
	containerFieldsZh,
	containerSectionZh,
	healthSectionZh,
	runtimeSectionZh,
} from "./container";
import {
	networkFieldsZh,
	networkSectionZh,
	requestSectionZh,
	taskMiscSectionZh,
} from "./network";
import {
	placementSectionZh,
	resourcesFieldsZh,
	resourcesSectionZh,
	restartSectionZh,
} from "./resources";
import {
	rollbackConfigSectionZh,
	rolloutFieldsZh,
	updateConfigSectionZh,
} from "./rollout";
import { modeSectionZh, serviceFieldsZh, serviceSectionZh } from "./service";
import { storageFieldsZh, storageSectionZh } from "./storage";

/**
 * Merges the translated copy over the English catalog.
 *
 * Keyed by section id / field id rather than by position, so a reordering in
 * `src/docker/catalog/` cannot silently pair the wrong prose with the wrong
 * field. For `en` the English objects are returned untouched — same reference,
 * which keeps `useSelector` comparisons downstream cheap and stable.
 *
 * The locale-aware queries live here rather than in `src/docker/catalog/` on
 * purpose: the dependency only ever points i18n → docker, so the catalog stays
 * importable by the pure modules (`build-spec`, `validate`, `share-link`) that
 * must not know about languages at all.
 */

const SECTION_COPY_ZH: Record<string, SectionCopy> = {
	service: serviceSectionZh,
	mode: modeSectionZh,
	container: containerSectionZh,
	runtime: runtimeSectionZh,
	health: healthSectionZh,
	storage: storageSectionZh,
	resources: resourcesSectionZh,
	restart: restartSectionZh,
	placement: placementSectionZh,
	network: networkSectionZh,
	"task-misc": taskMiscSectionZh,
	"update-config": updateConfigSectionZh,
	"rollback-config": rollbackConfigSectionZh,
	request: requestSectionZh,
};

const FIELD_COPY_ZH: FieldCopyTable = {
	...serviceFieldsZh,
	...containerFieldsZh,
	...networkFieldsZh,
	...storageFieldsZh,
	...resourcesFieldsZh,
	...rolloutFieldsZh,
};

function localizeField(field: FieldDef, locale: Locale): FieldDef {
	if (locale === "en") return field;
	const copy = FIELD_COPY_ZH[field.id];
	return copy ? applyFieldCopy(field, copy) : field;
}

function buildSections(locale: Locale): Array<SectionDef> {
	if (locale === "en") return SECTIONS;

	return SECTIONS.map((section) => {
		const copy = SECTION_COPY_ZH[section.id];
		const translated = copy ? applySectionCopy(section, copy) : section;
		return {
			...translated,
			fields: translated.fields.map((field) => localizeField(field, locale)),
		};
	});
}

/**
 * Localized catalogs, built once per locale. Components read these through
 * `useSelector`/`filter`, so returning a fresh array on every render would
 * defeat reference equality for no benefit.
 */
const SECTIONS_BY_LOCALE = new Map<Locale, Array<SectionDef>>();
const FIELDS_BY_LOCALE = new Map<Locale, Array<FieldDef>>();
const FIELD_INDEX_BY_LOCALE = new Map<Locale, Map<string, FieldDef>>();

function sectionsFor(locale: Locale): Array<SectionDef> {
	const cached = SECTIONS_BY_LOCALE.get(locale);
	if (cached) return cached;
	const built = buildSections(locale);
	SECTIONS_BY_LOCALE.set(locale, built);
	return built;
}

export function getSections(locale: Locale): Array<SectionDef> {
	return sectionsFor(locale);
}

export function getSpecSections(locale: Locale): Array<SectionDef> {
	return sectionsFor(locale).filter((section) => section.target !== "request");
}

export function getFields(locale: Locale): Array<FieldDef> {
	const cached = FIELDS_BY_LOCALE.get(locale);
	if (cached) return cached;
	const built = sectionsFor(locale).flatMap((section) => section.fields);
	FIELDS_BY_LOCALE.set(locale, built);
	return built;
}

export function getFieldById(id: string, locale: Locale): FieldDef | undefined {
	let index = FIELD_INDEX_BY_LOCALE.get(locale);
	if (!index) {
		index = new Map(getFields(locale).map((field) => [field.id, field]));
		FIELD_INDEX_BY_LOCALE.set(locale, index);
	}
	return index.get(id);
}
