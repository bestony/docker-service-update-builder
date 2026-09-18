/**
 * Structural self-check for the bilingual content.
 *
 * The type system already guarantees that both message dictionaries have the
 * same keys and that the Chinese catalog tables are complete. What it cannot
 * see is everything positional — a translated `details` list that lost a
 * paragraph, an option list whose hints slid out of alignment — plus the runtime
 * data that never touches a type at all. Those are asserted here.
 *
 * Run with `pnpm check-i18n`; it is part of `pnpm verify`.
 */
import { posts } from "#/content/posts";
import { postsZh } from "#/content/posts.zh";
import type { PostBlock } from "#/content/posts";
import { buildServiceSpec } from "#/docker/build-spec";
import { SECTIONS } from "#/docker/catalog";
import { applyPreset, createInitialStates, PRESETS } from "#/docker/presets";
import { buildCurlScript } from "#/docker/request";
import { validate } from "#/docker/validate";
import { getFields, getSections } from "#/i18n/catalog";
import { translator } from "#/i18n/messages";
import { en } from "#/i18n/messages-en";
import { zh } from "#/i18n/messages-zh";
import { presetCopy } from "#/i18n/presets";

const failures: Array<string> = [];

function check(condition: boolean, message: string) {
	if (!condition) failures.push(message);
}

function assertEqual(actual: unknown, expected: unknown, message: string) {
	check(
		JSON.stringify(actual) === JSON.stringify(expected),
		`${message} (expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)})`,
	);
}

/** Dotted paths of every string leaf in a nested dictionary. */
function flatten(value: unknown, prefix = ""): Array<string> {
	return typeof value === "object" && value !== null
		? Object.entries(value as Record<string, unknown>).flatMap(([key, sub]) =>
				flatten(sub, prefix ? `${prefix}.${key}` : key),
			)
		: [prefix];
}

function lookup(root: unknown, path: string): string {
	const value = path
		.split(".")
		.reduce<unknown>(
			(scope, segment) =>
				(scope as Record<string, unknown> | undefined)?.[segment],
			root,
		);
	return typeof value === "string" ? value : "";
}

const placeholders = (template: string) =>
	[...template.matchAll(/\{\{(\w+)\}\}/g)].map((match) => match[1]).sort();

/** The prose of a post block, or `null` for the kinds that carry none. */
function proseOf(block: PostBlock): string | null {
	if (block.kind === "ul") return block.items.join(" ");
	if (block.kind === "code") return null;
	return block.text;
}

/**
 * "Prose" is a run of text containing whitespace. Single tokens like `Order` or
 * `registryAuthFrom` are JSON keys and are *supposed* to stay English in the
 * Chinese catalog — that is the catalog's convention, not a missed translation.
 */
const isProse = (text: string | undefined) =>
	typeof text === "string" && /\s/.test(text.trim());

// --- message dictionaries ---------------------------------------------------

assertEqual(flatten(zh).sort(), flatten(en).sort(), "zh message keys differ from en");

for (const key of flatten(en)) {
	const source = lookup(en, key);
	const target = lookup(zh, key);
	// A sentence that loses its placeholder silently drops a value at runtime,
	// where nothing else would notice.
	assertEqual(
		placeholders(target),
		placeholders(source),
		`placeholders differ at ${key}`,
	);
	check(target.trim() !== "", `empty zh message at ${key}`);
	check(!/^TODO|^FIXME/.test(target), `unfinished zh message at ${key}`);
}

// --- presets ----------------------------------------------------------------

for (const preset of PRESETS) {
	for (const locale of ["en", "zh"] as const) {
		const copy = presetCopy(preset.id, locale);
		check(copy !== undefined, `no ${locale} copy for preset ${preset.id}`);
		check(
			(copy?.title.trim() ?? "") !== "" &&
				(copy?.summary.trim() ?? "") !== "" &&
				(copy?.rationale.trim() ?? "") !== "",
			`incomplete ${locale} copy for preset ${preset.id}`,
		);
	}
}

// --- catalog ----------------------------------------------------------------

const zhSections = getSections("zh");
assertEqual(
	zhSections.map((section) => section.id),
	SECTIONS.map((section) => section.id),
	"zh section ids/order differ from en",
);

const enFields = getFields("en");
const zhFields = getFields("zh");
assertEqual(
	zhFields.map((field) => field.id),
	enFields.map((field) => field.id),
	"zh field ids/order differ from en",
);

for (const [index, field] of enFields.entries()) {
	const translated = zhFields[index];

	// Code-ish values must be identical in both languages: they are what the
	// generator emits and what the search filter matches on.
	for (const key of ["path", "key", "type", "cli", "compose"] as const) {
		assertEqual(translated[key], field[key], `${field.id}.${key} was translated`);
	}

	assertEqual(
		translated.details.length,
		field.details.length,
		`${field.id}.details paragraph count differs`,
	);
	assertEqual(
		translated.options?.length,
		field.options?.length,
		`${field.id}.options count differs`,
	);
	assertEqual(
		translated.columns?.length,
		field.columns?.length,
		`${field.id}.columns count differs`,
	);

	for (const [optionIndex, option] of (translated.options ?? []).entries()) {
		assertEqual(
			option.value,
			field.options?.[optionIndex]?.value,
			`${field.id}.options[${optionIndex}].value`,
		);
		check(
			option.label.trim() !== "" && option.hint.trim() !== "",
			`empty zh option copy at ${field.id}[${optionIndex}]`,
		);
	}

	for (const [columnIndex, column] of (translated.columns ?? []).entries()) {
		assertEqual(
			column.key,
			field.columns?.[columnIndex]?.key,
			`${field.id}.columns[${columnIndex}].key`,
		);
		assertEqual(
			column.options?.length,
			field.columns?.[columnIndex]?.options?.length,
			`${field.id}.columns[${columnIndex}].options count`,
		);
		check(
			column.label.trim() !== "" && column.hint.trim() !== "",
			`empty zh column copy at ${field.id}.${column.key}`,
		);
	}

	// Nothing with a space in it may survive verbatim — that is a whole sentence
	// still in English sitting next to Chinese text in the UI.
	for (const key of ["title", "summary"] as const) {
		check(
			!isProse(field[key]) || translated[key] !== field[key],
			`${field.id}.${key} is still English: ${translated[key]}`,
		);
	}
	for (const [paragraphIndex, paragraph] of field.details.entries()) {
		check(
			translated.details[paragraphIndex] !== paragraph,
			`${field.id}.details[${paragraphIndex}] is still English`,
		);
	}
	if (isProse(field.caution)) {
		check(
			translated.caution !== field.caution,
			`${field.id}.caution is still English`,
		);
	}
}

for (const [index, section] of SECTIONS.entries()) {
	const translated = zhSections[index];
	assertEqual(
		translated.details?.length ?? 0,
		section.details?.length ?? 0,
		`${section.id}.details paragraph count differs`,
	);
	check(
		!isProse(section.summary) || translated.summary !== section.summary,
		`${section.id}.summary is still English`,
	);
}

// --- field guide ------------------------------------------------------------

assertEqual(
	postsZh.map((post) => post.slug),
	posts.map((post) => post.slug),
	"zh post slugs differ from en",
);

for (const [index, post] of posts.entries()) {
	const translated = postsZh[index];
	const scope = post.slug;

	for (const key of ["date", "readingMinutes", "tags", "sections"] as const) {
		assertEqual(translated[key], post[key], `${scope}.${key} differs`);
	}
	assertEqual(
		translated.blocks.length,
		post.blocks.length,
		`${scope}.blocks length differs`,
	);

	for (const [blockIndex, block] of post.blocks.entries()) {
		const other = translated.blocks[blockIndex];
		assertEqual(other.kind, block.kind, `${scope}.blocks[${blockIndex}].kind`);

		// Code samples are what gets pasted into a shell, so they must be
		// byte-identical — a "translated" command is a broken command.
		if (block.kind === "code" && other.kind === "code") {
			assertEqual(
				other.code,
				block.code,
				`${scope}.blocks[${blockIndex}].code was translated`,
			);
			assertEqual(
				other.language,
				block.language,
				`${scope}.blocks[${blockIndex}].language`,
			);
			continue;
		}

		check(
			proseOf(other) !== proseOf(block),
			`${scope}.blocks[${blockIndex}] is still English`,
		);
	}
}

// --- locale independence of the generated output ----------------------------

// Same field states, both locales. A language switch must never change what
// gets deployed, so the JSON body is compared directly and the curl scripts are
// compared with their comment lines stripped.
const states = applyPreset(createInitialStates(), PRESETS[1]);
const options = {
	serviceId: "api-gateway",
	version: "42",
	rollback: "",
	registryAuthFrom: "",
};
const body = buildServiceSpec(states);
const curlEn = buildCurlScript(body, options, translator("en"));
const curlZh = buildCurlScript(body, options, translator("zh"));
const stripComments = (script: string) =>
	script
		.split("\n")
		.filter((line) => !line.startsWith("#"))
		.join("\n")
		.trim();

assertEqual(
	stripComments(curlZh),
	stripComments(curlEn),
	"curl commands differ between locales",
);
check(
	curlZh !== curlEn,
	"the curl comments should differ between locales — check the dictionary",
);

// Validation must reach the same verdict in both languages: same count, same
// levels, same field ids. Only the wording may move.
const issuesEn = validate(states, translator("en"));
const issuesZh = validate(states, translator("zh"));
assertEqual(
	issuesZh.map((issue) => [issue.level, issue.fieldIds]),
	issuesEn.map((issue) => [issue.level, issue.fieldIds]),
	"validation verdicts differ between locales",
);
check(issuesEn.length > 0, "the zero-downtime preset should trigger a review");
for (const issue of issuesZh) {
	check(
		issue.title !== issuesEn.find((e) => e.fieldIds === issue.fieldIds)?.title,
		`untranslated issue title: ${issue.title}`,
	);
	check(
		/[\u4e00-\u9fff]/.test(issue.detail),
		`untranslated issue detail: ${issue.detail}`,
	);
}

if (failures.length > 0) {
	console.error(`check-i18n: ${failures.length} problem(s)\n`);
	for (const failure of failures) console.error(`  - ${failure}`);
	process.exit(1);
}

console.log("check-i18n: ok");
