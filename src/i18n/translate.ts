import type { UiMessages, UiMessagesShape } from "./messages-en";

/**
 * The message dictionary is nested for readability but addressed by a dotted
 * path (`field.serialisesTo`), so the key union is derived from the English
 * dictionary's shape. Adding a message to `en` and forgetting it in `zh` is a
 * type error in `messages-zh.ts`; using a key that does not exist is a type
 * error here.
 */
export type Paths<T> = {
	[K in keyof T & string]: T[K] extends string ? K : `${K}.${Paths<T[K]>}`;
}[keyof T & string];

export type MessageKey = Paths<UiMessages>;

export type TranslateVars = Record<string, string | number>;

export type Translate = (key: MessageKey, vars?: TranslateVars) => string;

const PLACEHOLDER = /\{\{(\w+)\}\}/g;

/**
 * Substitutes `{{name}}` placeholders. There is no plural or select rule
 * engine: both languages need at most a "one" and an "other" form, and those
 * are explicit keys.
 */
function format(template: string, vars: TranslateVars): string {
	return template.replace(PLACEHOLDER, (match, name: string) =>
		name in vars ? String(vars[name]) : match,
	);
}

function lookup(messages: UiMessagesShape, key: string): string | undefined {
	const value = key
		.split(".")
		.reduce<unknown>(
			(scope, segment) =>
				typeof scope === "object" && scope !== null
					? (scope as Record<string, unknown>)[segment]
					: undefined,
			messages,
		);

	return typeof value === "string" ? value : undefined;
}

/** Binds a dictionary to a `t()` function. The returned function is stable. */
export function translatorFor(messages: UiMessagesShape): Translate {
	return (key, vars) => {
		const template = lookup(messages, key);
		// Unreachable through the type system; keeps a bad runtime key visible
		// instead of rendering "undefined".
		if (template === undefined) return key;
		return vars ? format(template, vars) : template;
	};
}
