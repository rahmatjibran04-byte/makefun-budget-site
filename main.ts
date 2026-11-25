// main.ts — Hearth's hand-in program (Node 22, standard library only).
// The site is plain static files in app/ next to this file: no build step,
// no network, nothing to install. This program copies app/ and screenshots/
// into the output directory (or $MAKEFUN_OUTPUT_DIR outside the grader)
// and writes dossier.json there with the vendored make.fun library, exactly
// as the scorer rebuilds it. vendor/makefun-frontend.ts is the kit's copy,
// unchanged. Run it with: MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-frontend.ts";

// Files this program writes must be world-readable (0644) whatever the
// caller's umask is, so set it before writing anything.
process.umask(0o022);

const here = fileURLToPath(new URL(".", import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

mkdirSync(out, { recursive: true });
cpSync(join(here, "app"), join(out, "app"), { recursive: true });
mkdirSync(join(out, "screenshots"), { recursive: true });
if (existsSync(join(here, "screenshots"))) {
  cpSync(join(here, "screenshots"), join(out, "screenshots"), { recursive: true });
}

// The scorer's own caps: at most 4 screenshots, each at most 256 KiB;
// at most 993 files and directories in app/, at most 16 MiB of app files.
// The dossier text is capped at 160 KiB by the library.
writeFileSync(
  join(out, "dossier.json"),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 16777216,
  }),
);
