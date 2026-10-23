import z from "@deepseek-ai/schemastery";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { isAbsolute, join, relative, resolve, sep } from "node:path";
//#region lib/types/output-folders.js
/** Discovery and validation for the ComfyUI output folder the Content library browses. */
/** File extensions the ComfyUI controller streams from an output folder. */
const MEDIA_FILE = /\.(?:png|jpe?g|webp|gif|avif|bmp|mp4|webm|mov|mkv)$/iu;
/** Bound on one listing so a huge output folder cannot stall the route. */
const MAX_LISTED_ENTRIES = 5e3;
/** Report whether a path names an existing directory.
* @param value Absolute candidate path.
* @returns True when the directory exists and is readable as a directory.
*/
function isDirectory(value) {
	if (value.trim() === "" || !isAbsolute(value)) return false;
	try {
		return statSync(value).isDirectory();
	} catch {
		return false;
	}
}
/** Count the media files directly inside a folder.
* @param folder Absolute directory path.
* @returns File count, or -1 when the folder cannot be listed.
*/
function countMediaFiles(folder) {
	try {
		let files = 0;
		let seen = 0;
		for (const entry of readdirSync(folder, { withFileTypes: true })) {
			if (++seen > MAX_LISTED_ENTRIES) break;
			if (entry.isFile() && MEDIA_FILE.test(entry.name)) files += 1;
		}
		return files;
	} catch {
		return -1;
	}
}
/** Read comfy-cli's recorded ComfyUI workspace.
* @param env Environment holding the platform app-data root.
* @param home Fallback home directory.
* @returns The recorded workspace path, or null when comfy-cli keeps no config.
*/
function comfyCliWorkspace(env = process.env, home = homedir()) {
	const appData = env.LOCALAPPDATA?.trim();
	const candidates = [
		...appData === void 0 || appData === "" ? [] : [join(appData, "comfy-cli", "config.ini")],
		...process.platform === "darwin" ? [join(home, "Library", "Application Support", "comfy-cli", "config.ini")] : [],
		join(home, ".config", "comfy-cli", "config.ini")
	];
	for (const file of candidates) {
		let text;
		try {
			text = readFileSync(file, "utf8");
		} catch {
			continue;
		}
		const recorded = /^\s*recent[_-]workspace\s*=\s*(.+)$/imu.exec(text)?.[1]?.trim();
		if (recorded !== void 0 && recorded !== "") return recorded;
	}
	return null;
}
/** Collect the output folders worth offering as the library root, best first.
* @param options Environment and home overrides used by tests.
* @returns Existing directories only, deduplicated by resolved path.
*/
function discoverOutputFolders(options = {}) {
	const env = options.env ?? process.env;
	const home = options.home ?? homedir();
	const workspace = comfyCliWorkspace(env, home);
	const proposed = [
		env.ARYAAI_COMFYUI_OUTPUT_DIR,
		...workspace === null ? [] : [join(workspace, "output")],
		join(home, "Documents", "comfy", "ComfyUI", "output"),
		join(home, "Documents", "ComfyUI", "output"),
		join(home, "ComfyUI", "output")
	];
	const found = [];
	const seen = /* @__PURE__ */ new Set();
	for (const value of proposed) {
		if (value === void 0) continue;
		const folder = value.trim();
		if (!isDirectory(folder)) continue;
		const key = resolve(folder).toLocaleLowerCase();
		if (seen.has(key)) continue;
		seen.add(key);
		found.push({
			path: resolve(folder),
			files: countMediaFiles(folder)
		});
	}
	return found;
}
/** Resolve a media reference inside its output folder.
* @param root Configured output folder.
* @param subfolder ComfyUI subfolder, empty at the root.
* @param filename File name reported by the library.
* @returns The absolute file path, or null when it would escape the folder.
*/
function resolveMediaPath(root, subfolder, filename) {
	if (root.trim() === "" || !isAbsolute(root) || filename.trim() === "") return null;
	const base = resolve(root);
	const target = resolve(base, subfolder, filename);
	const inside = relative(base, target);
	if (isAbsolute(inside) || inside === ".." || inside.startsWith(`..${sep}`)) return null;
	return target;
}
//#endregion
//#region lib/types/index.js
/** Legacy preview preference and the cadence of Images server availability checks. */
const Config = z.object({
	autoPreview: z.boolean().default(true).volatile(),
	permissionPreset: z.string().min(1).default("danger-full-access").volatile(),
	agentPreset: z.string().min(1).default("content").volatile(),
	serverStatusPollIntervalMs: z.number().step(1).min(1e3).default(1e4).volatile()
});
/** Route prefix owned by this plugin. */
const ROUTE = "/plugins/ui-images";
/** Largest request body accepted by a route here. */
const MAX_BODY_BYTES = 8 * 1024;
/** Bound on one native launch so a stuck launcher cannot hold the request open. */
const LAUNCH_TIMEOUT_MS = 15e3;
/** Bound on one open folder chooser: a person is choosing, so this only stops a stranded dialog. */
const PICK_TIMEOUT_MS = 6e5;
/** Register the configuration projection consumed by the browser.
* @param ctx - Host context providing settings and, where available, the route server.
*/
function apply(ctx) {
	ctx.inject(["settings"], (child) => {
		child.effect(() => child.settings.configure({ auto: false }, ctx.fiber));
	});
	ctx.inject(["webServer"], (child) => {
		child.effect(() => child.webServer.register({
			kind: "exact",
			path: `${ROUTE}/output-folders`,
			handler: (request, response) => {
				serveOutputFolders(request, response);
			}
		}, "ui-images: output folders"), "ui-images: output folders route");
		child.effect(() => child.webServer.register({
			kind: "exact",
			path: `${ROUTE}/open-folder`,
			handler: (request, response) => {
				serveOpenFolder(request, response);
			}
		}, "ui-images: open folder"), "ui-images: open folder route");
		child.effect(() => child.webServer.register({
			kind: "exact",
			path: `${ROUTE}/reveal-media`,
			handler: (request, response) => {
				serveRevealMedia(request, response);
			}
		}, "ui-images: reveal media"), "ui-images: reveal media route");
		child.effect(() => child.webServer.register({
			kind: "exact",
			path: `${ROUTE}/pick-folder`,
			handler: (request, response) => {
				servePickFolder(child, request, response);
			}
		}, "ui-images: pick folder"), "ui-images: pick folder route");
	});
}
/** Write one JSON response.
* @param response Node response.
* @param status HTTP status code.
* @param body JSON-serializable payload.
*/
function sendJson(response, status, body) {
	response.writeHead(status, {
		"content-type": "application/json",
		"cache-control": "no-store"
	});
	response.end(JSON.stringify(body));
}
/** Reject a cross-origin browser request.
* @param request Node request.
* @returns True when the request carries no foreign Origin.
*/
function sameOrigin(request) {
	const origin = request.headers.origin;
	const host = request.headers.host;
	if (origin === void 0 || host === void 0) return true;
	return origin === `http://${host}` || origin === `https://${host}`;
}
/** Read a bounded JSON request body.
* @param request Node request.
* @returns Parsed payload, or undefined when the body is not an accepted JSON object.
*/
async function readJsonBody(request) {
	const chunks = [];
	let bytes = 0;
	for await (const chunk of request) {
		const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk));
		bytes += buffer.byteLength;
		if (bytes > MAX_BODY_BYTES) return void 0;
		chunks.push(buffer);
	}
	try {
		const parsed = JSON.parse(Buffer.concat(chunks).toString("utf8"));
		return typeof parsed === "object" && parsed !== null && !Array.isArray(parsed) ? parsed : void 0;
	} catch {
		return;
	}
}
/** Guard a JSON POST route.
* @param request Node request.
* @param response Node response.
* @returns True when the caller may continue handling the request.
*/
function acceptJsonPost(request, response) {
	if (request.method !== "POST") {
		sendJson(response, 405, {
			ok: false,
			error: "method-not-allowed"
		});
		return false;
	}
	if (!(request.headers["content-type"] ?? "").toLocaleLowerCase().startsWith("application/json")) {
		sendJson(response, 415, {
			ok: false,
			error: "json-required"
		});
		return false;
	}
	if (!sameOrigin(request)) {
		sendJson(response, 403, {
			ok: false,
			error: "origin-rejected"
		});
		return false;
	}
	return true;
}
/** Abort a native operation once its own deadline elapses.
* @param timeoutMs How long the native operation may run.
* @returns A signal the caller must pass to the native launcher.
*/
function operationSignal(timeoutMs) {
	const controller = new AbortController();
	setTimeout(() => {
		controller.abort();
	}, timeoutMs).unref();
	return controller.signal;
}
/** Report the output folders worth offering and whether this host can reveal them. */
async function serveOutputFolders(request, response) {
	if (request.method !== "GET" && request.method !== "HEAD") {
		sendJson(response, 405, {
			ok: false,
			error: "method-not-allowed"
		});
		return;
	}
	if (!sameOrigin(request)) {
		sendJson(response, 403, {
			ok: false,
			error: "origin-rejected"
		});
		return;
	}
	try {
		const native = await import("@deepseek-ai/dsh-native-command");
		sendJson(response, 200, {
			ok: true,
			candidates: discoverOutputFolders(),
			canOpen: native.canOpenNativePath(),
			fileManager: native.nativeFileManager()
		});
	} catch {
		sendJson(response, 200, {
			ok: true,
			candidates: discoverOutputFolders(),
			canOpen: false,
			fileManager: null
		});
	}
}
/** Open a folder in the host file manager. */
async function serveOpenFolder(request, response) {
	if (!acceptJsonPost(request, response)) return;
	const body = await readJsonBody(request);
	const directory = typeof body?.directory === "string" ? body.directory.trim() : "";
	if (!isDirectory(directory)) {
		sendJson(response, 400, {
			ok: false,
			error: "folder-required"
		});
		return;
	}
	try {
		const native = await import("@deepseek-ai/dsh-native-command");
		if (!native.canOpenNativePath()) {
			sendJson(response, 501, {
				ok: false,
				error: "no-desktop"
			});
			return;
		}
		await native.openNativePath(directory, operationSignal(LAUNCH_TIMEOUT_MS));
		sendJson(response, 200, { ok: true });
	} catch (error) {
		sendJson(response, 502, {
			ok: false,
			error: error instanceof Error ? error.message : String(error)
		});
	}
}
/** Select one saved file inside its output folder, or open that folder. */
async function serveRevealMedia(request, response) {
	if (!acceptJsonPost(request, response)) return;
	const body = await readJsonBody(request);
	const directory = typeof body?.directory === "string" ? body.directory.trim() : "";
	const subfolder = typeof body?.subfolder === "string" ? body.subfolder : "";
	const filename = typeof body?.filename === "string" ? body.filename.trim() : "";
	if (!isDirectory(directory)) {
		sendJson(response, 400, {
			ok: false,
			error: "folder-required"
		});
		return;
	}
	if (filename === "") {
		await serveOpenFolderBody(directory, response);
		return;
	}
	const target = resolveMediaPath(directory, subfolder, filename);
	if (target === null) {
		sendJson(response, 403, {
			ok: false,
			error: "outside-folder"
		});
		return;
	}
	try {
		const native = await import("@deepseek-ai/dsh-native-command");
		if (!native.canOpenNativePath()) {
			sendJson(response, 501, {
				ok: false,
				error: "no-desktop"
			});
			return;
		}
		await native.revealNativePath(target, operationSignal(LAUNCH_TIMEOUT_MS));
		sendJson(response, 200, { ok: true });
	} catch (error) {
		sendJson(response, 502, {
			ok: false,
			error: error instanceof Error ? error.message : String(error)
		});
	}
}
/** Open one already-validated directory.
* @param directory Existing absolute directory.
* @param response Node response.
*/
async function serveOpenFolderBody(directory, response) {
	try {
		const native = await import("@deepseek-ai/dsh-native-command");
		if (!native.canOpenNativePath()) {
			sendJson(response, 501, {
				ok: false,
				error: "no-desktop"
			});
			return;
		}
		await native.openNativePath(directory, operationSignal(LAUNCH_TIMEOUT_MS));
		sendJson(response, 200, { ok: true });
	} catch (error) {
		sendJson(response, 502, {
			ok: false,
			error: error instanceof Error ? error.message : String(error)
		});
	}
}
/** Open the host's directory chooser and report the picked path. */
async function servePickFolder(ctx, request, response) {
	if (!acceptJsonPost(request, response)) return;
	let picker;
	try {
		picker = ctx.directoryPicker;
	} catch {
		picker = void 0;
	}
	if (picker === void 0) {
		sendJson(response, 501, {
			ok: false,
			error: "no-picker"
		});
		return;
	}
	const capability = picker.capability();
	if (capability.kind !== "native") {
		sendJson(response, 501, {
			ok: false,
			error: "no-native-picker"
		});
		return;
	}
	try {
		sendJson(response, 200, {
			ok: true,
			path: await capability.pick(operationSignal(PICK_TIMEOUT_MS))
		});
	} catch (error) {
		sendJson(response, 502, {
			ok: false,
			error: error instanceof Error ? error.message : String(error)
		});
	}
}
//#endregion
export { Config, apply };
