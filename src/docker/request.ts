import type { JsonValue, UpdateRequestOptions } from "./build-spec";

/** The Engine API version this catalog was generated against. */
export const API_VERSION = "v1.43";

export const API_DOC_URL =
	"https://docs.docker.com/reference/api/engine/version/v1.43/#tag/Service/operation/ServiceUpdate";

export function buildUpdatePath(options: UpdateRequestOptions): string {
	const query = new URLSearchParams();
	if (options.version) query.set("version", options.version);
	if (options.rollback) query.set("rollback", options.rollback);
	if (options.registryAuthFrom)
		query.set("registryAuthFrom", options.registryAuthFrom);

	const search = query.toString();
	return `/${API_VERSION}/services/${options.serviceId}/update${search ? `?${search}` : ""}`;
}

/**
 * Renders the two-step read-modify-write flow the endpoint really needs.
 *
 * The generated body is a *partial* spec on purpose — it is the diff you want.
 * Step 1 exists because the daemon replaces the whole ServiceSpec, so the diff
 * has to be merged into the current spec before it is sent back.
 */
export function buildCurlScript(
	spec: Record<string, JsonValue>,
	options: UpdateRequestOptions,
): string {
	const socket = "--unix-socket /var/run/docker.sock";
	const host = "http://localhost";
	const body = `${JSON.stringify(spec, null, 2)}\n`;

	const readStep = [
		"# 1. Read the current spec and its version index.",
		`curl -s ${socket} \\`,
		`  ${host}/${API_VERSION}/services/${options.serviceId} \\`,
		"  | jq '{ version: .Version.Index, spec: .Spec }'",
	].join("\n");

	const mergeStep = [
		"# 2. Merge the object below into that .Spec (jq '. * $patch' does a deep merge),",
		"#    then POST the merged spec back. Sending the patch on its own would",
		"#    clear every key you left out.",
	].join("\n");

	const writeStep = [
		`curl -s -X POST ${socket} \\`,
		"  -H 'Content-Type: application/json' \\",
		`  '${host}${buildUpdatePath(options)}' \\`,
		"  --data-binary @- <<'JSON'",
		body.trimEnd(),
		"JSON",
	].join("\n");

	return [readStep, "", mergeStep, writeStep].join("\n");
}
