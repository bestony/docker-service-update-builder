import type { FieldDef, SectionDef } from "../field-types";
import { containerSection, healthSection, runtimeSection } from "./container";
import { networkSection, requestSection, taskMiscSection } from "./network";
import {
	placementSection,
	resourcesSection,
	restartSection,
} from "./resources";
import { rollbackConfigSection, updateConfigSection } from "./rollout";
import { modeSection, serviceSection } from "./service";
import { storageSection } from "./storage";

/**
 * The catalog is ordered the way an operator reasons about a service: identity
 * first, then what runs, then how much it may consume, then how it is rolled
 * out, and finally how the HTTP request itself is shaped.
 */
export const SECTIONS: Array<SectionDef> = [
	serviceSection,
	modeSection,
	containerSection,
	runtimeSection,
	healthSection,
	storageSection,
	resourcesSection,
	restartSection,
	placementSection,
	networkSection,
	taskMiscSection,
	updateConfigSection,
	rollbackConfigSection,
	requestSection,
];

/** Sections whose fields end up in the JSON body of the update request. */
export const SPEC_SECTIONS = SECTIONS.filter(
	(section) => section.target !== "request",
);

export const REQUEST_SECTION = requestSection;

export const ALL_FIELDS: Array<FieldDef> = SECTIONS.flatMap(
	(section) => section.fields,
);

export const FIELDS_BY_ID = new Map(
	ALL_FIELDS.map((field) => [field.id, field]),
);

export const SECTION_OF_FIELD = new Map(
	SECTIONS.flatMap((section) =>
		section.fields.map((field) => [field.id, section] as const),
	),
);

export function getField(id: string): FieldDef | undefined {
	return FIELDS_BY_ID.get(id);
}
