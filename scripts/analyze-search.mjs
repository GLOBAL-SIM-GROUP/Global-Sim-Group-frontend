import fs from "node:fs";
import path from "node:path";

const root = path.resolve("src");
const features = path.join(root, "features");
const routes = path.join(root, "routes");

function read(p) {
	try {
		return fs.readFileSync(p, "utf8");
	} catch {
		return null;
	}
}

function find(dir, filter) {
	const res = [];
	for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
		const p = path.join(dir, f.name);
		if (f.isDirectory()) res.push(...find(p, filter));
		else if (filter(p, f.name)) res.push(p);
	}
	return res;
}

function strip(s) {
	return s.replace(root, "").replace(/\\/g, "/");
}

const apiFiles = find(features, (p, n) => n.endsWith(".ts") && p.includes("/api/"));
const hookFiles = find(features, (p, n) => n.startsWith("use-") && n.endsWith(".ts") && p.includes("/hooks/"));
const pageFiles = find(features, (p, n) => n.endsWith("-page.tsx"));
const routeFiles = find(routes, (p, n) => n === "index.tsx");

function extractListFn(content) {
	const m = content.match(/export (?:async )?function (list[A-Za-z]+)\s*\(([^)]*)\)/s);
	if (!m) return null;
	return {
		name: m[1],
		args: m[2].trim(),
		hasSearch: /search|recherche/.test(m[2]),
	};
}

function extractUseHook(content) {
	const m = content.match(/export function (use[A-Za-z]+)\s*\(([^)]*)\)\s*\{[\s\S]*?useQuery\s*\(/s);
	if (!m) return null;
	return {
		name: m[1],
		args: m[2].trim(),
		hasSearch: /search|recherche/.test(m[2]),
	};
}

function pageInfo(content) {
	const hasTable = /<table|<[A-Z][A-Za-z]+Table/.test(content);
	const hasSearchInterface = /search\??: string|recherche\??: string/.test(content);
	const hasSearchUI = /placeholder=".*Rechercher/.test(content);
	const hasSearchState = /\bsearch\b|\brecherche\b/.test(content);
	const hasInitialSearch = /initialSearch/.test(content);
	const hasOnSearchChange = /onSearchChange/.test(content);
	const useCall = [...content.matchAll(/\buse([A-Z][a-zA-Z]+)\s*\(/g)].map((x) => x[1]);
	const searchInterface =
		content.match(/export interface ([A-Za-z]+Search) \{[\s\S]{0,500}?\}/s)?.[1] || null;
	return {
		hasTable,
		hasSearchInterface,
		hasSearchUI,
		hasSearchState,
		hasInitialSearch,
		hasOnSearchChange,
		useCall: [...new Set(useCall)].slice(0, 8),
		searchInterface,
	};
}

const out = { api: [], hooks: [], pages: [], routes: [] };
for (const p of apiFiles) {
	const c = read(p);
	const e = extractListFn(c);
	if (e) out.api.push({ file: strip(p), ...e });
}
for (const p of hookFiles) {
	const c = read(p);
	const e = extractUseHook(c);
	if (e) out.hooks.push({ file: strip(p), ...e });
}
for (const p of pageFiles) {
	const c = read(p);
	const i = pageInfo(c);
	if (i.hasTable) out.pages.push({ file: strip(p), ...i });
}
for (const p of routeFiles) {
	const c = read(p);
	const m = c.match(/validateSearch:\s*z\.object\(\{([\s\S]*?)\}\)/s);
	out.routes.push({
		file: strip(p),
		hasValidate: !!m,
		searchField: /search\??:|recherche\??:/.test(m?.[1] || ""),
	});
}

console.log(JSON.stringify(out, null, 2));
