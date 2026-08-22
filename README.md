# @staff-os/dsh-workbench

An enterprise workbench for the DeepSeek Harness: **AI employees, knowledge bases, skills,
MCP servers and DSH plugins**, all manageable from a running session.

**Standalone** — no external backend, no database. Every piece of state is a local file
under `$DSH_HOME`.

[中文文档](./README.zh.md)

## Install

```bash
dsh plugin --profile web add @staff-os/dsh-workbench
```

For local development, pass an absolute path:

```bash
dsh plugin --profile web add link:E:/path/to/dsh-workbench
```

Restart DSH afterwards.

## Configure

The bundled `cordis.patch.yml` is an opt-in patch layer that reads its configuration from the
environment:

| Variable | Purpose |
| --- | --- |
| `DSH_PROFILE` | Which profile MCP and plugin management act on. Defaults to `web`. |
| `CLAWHUB_REGISTRY` | Root URL of a ClawHub-compatible marketplace. Without it, the shipped source is used (ClawHub's official site, whose read-only API is public and needs no token). |
| `CLAWHUB_API_KEY` | Marketplace credential. **Only the reference name is stored; the value resolves through the credentials service or the launch environment — never inline it in YAML.** |

Environment variables come from `$DSH_HOME/.env` and from the `.env` of the directory `dsh` was
invoked in — both are read at startup, the nearer layer wins, and a name already in the process
environment is never replaced.

**To point at a self-hosted marketplace**, edit the profile's own patch layer
(`$DSH_HOME/profiles/<name>/cordis.patch.yml`) rather than the environment variable: that variable
only changes the URL, while `id` and the display name stay hardcoded, so the UI ends up labelling an
internal host "ClawHub". The patch layer is hot-reloaded — no restart:

```yaml
# A patch replaces the whole `config`; it does not deep-merge. Restate every key.
- id: workbench
  config:
    profile: !!js >-
      process.env.DSH_PROFILE?.trim() || 'web'
    registries:
      - id: skillhub
        name: Internal Skill Hub
        url: http://10.0.14.55        # self-hosted, compatible with ClawHub's /api/v1
        flavor: clawhub
        apiKeyEnv: SKILLHUB_REGISTRY_API_KEY   # omit when anonymous reads suffice
    registryTimeoutMs: 15000
```

`registries` aggregates: list two and the marketplace page searches both, each card labelled with
the source it came from. The `id` is recorded in the install ledger and update checks return to that
same source through it, so **do not change an `id` after installing from it** — those entries lose
their update path.

`flavor` is the protocol dialect, and it has exactly two values: `clawhub` (the default, and what
any ClawHub-compatible self-hosted deployment uses) and `skillhub` (deployments like
`api.skillhub.cn`, which split browsing into `/api/v1/showcase/*` chart endpoints and answer 405 on
`/api/v1/skills`).

Edit the patch directly for finer control. `config` accepts:

```yaml
- insert:
    - id: workbench
      name: '@staff-os/dsh-workbench'
      config:
        profile: web                 # profile to act on
        dshHome: ''                  # override $DSH_HOME; empty resolves from the environment
        registries:                  # aggregated across sources; shared by both marketplaces
          - id: clawhub
            name: ClawHub
            url: https://clawhub.ai
            flavor: clawhub          # clawhub | skillhub
            apiKeyEnv: CLAWHUB_API_KEY
        registryTimeoutMs: 15000     # one marketplace request
        toolTimeoutMs: 20000         # local write operations
        networkToolTimeoutMs: 120000 # operations that download (skill import, marketplace install)
        dshExecutable: dsh           # what plugin install/remove forwards to
        pluginToolTimeoutMs: 300000  # a pnpm install can take tens of seconds
```

## The five tools

One tool per domain, with an `action` parameter. **Destructive actions require an explicit
`confirm: true`** — without it the call errors and nothing is written.

### `workbench_employee` — AI employees

`list` `get` `create` `update` `bind` `delete`(confirm)

An AI employee is a DSH agent preset. Discovery, trust level, copying and deletion all go
through the native `ctx.agentPresets`. `create` copies an existing employee's directory
whole — the preset authoring API deliberately refuses caller-supplied composition text, so a
copy can never carry more capability than its source. Presets with `trust: system` ship with
the deployment and can be neither modified nor deleted.

`bind` writes `employee.yml` inside the preset directory, naming the knowledge bases, skills
and MCP servers this employee should use. **This is a declaration of responsibility, not
auto-wiring**: DSH does not start retrieving just because a knowledge base is bound. Bindings
pointing at things that do not exist are reported in `unknownBindings`.

### `workbench_knowledge` — knowledge bases

`list` `create` `get` `update` `delete`(confirm)
`add_document` `list_documents` `delete_document`(confirm) `search`

Retrieval is **BM25 keyword matching**, not semantic vector search: DSH's `ctx.llm` is a chat
adapter registry with no embedding capability, so a standalone build has nowhere to get
vectors. The returned `mode` is always `keyword`, matching the shape the backend returns when
it falls back to keyword recall.

Chinese text is tokenized into CJK bigrams and **deliberately not unigrams** — unigrams look
like better recall for single-character queries, but they turn characters that appear in nearly
every chunk into matchable terms, so any query containing one recalls the entire corpus.

Text only. PDF and Office files are rejected with a clear message; convert them to Markdown or
plain text first.

### `workbench_skill` — skills (local + marketplace)

Local: `list` `get` `create` `set_visibility` `import` `delete`(confirm)
Marketplace: `market_search` `market_get` `market_install` `market_update` `check_updates`

Reads go through the native `ctx.skills`, which already carries rank and same-name shadowing.
The `shadowed` flag means "this skill exists on disk but a higher-priority source of the same
name covers it" — without it, "I created it and still cannot call it" becomes unanswerable.

**Every write re-reads `ctx.skills` and reports whether that skill actually took effect**,
rather than predicting it. No restart is needed (see "Three things the skills domain must not
paper over" below), but "written" and "in effect" remain two different things: same-name
shadowing, or frontmatter DSH rejects, both turn a successful write into nothing.

`list` also reports the **rejected files**: on disk, but discarded whole by DSH because their
frontmatter breaks its rules. DSH only logs a warning for those, so if this does not say it,
nothing will.

`import` accepts a local archive path, a download URL, a GitHub repository URL, or a marketplace
slug. GitHub page URLs are rewritten to the `/tarball` endpoint. Unpacking validates entry count,
per-file and total size, and rejects `..`, absolute paths and NUL bytes; files land in a staging
directory **outside the skill root**, and only a validated directory is renamed into place.

The UI adds an **upload** entry: pick an archive in the browser and its bytes ride along with one
call. It shares the same unpacking and install path as `import`, differing in exactly two ways — an
8 MiB cap per upload (this path has no chunking and no streaming, and base64 adds another third, so
copying the unpacker's 50 MiB limit would blow up a single call), and **no ledger entry**: an
uploaded package has no marketplace coordinates, and a fabricated one would make later update checks
take the skill's name to the marketplace, find some unrelated package of the same name, and overwrite
the user's own work with it.

**The installed directory name comes from the package's own frontmatter `name`**: that is the
identity DSH registers.

### `workbench_mcp` — MCP servers

`list` `get` `add` `update` `delete`(confirm) `enable` `disable` `import_json`

MCP configuration lives as `@deepseek-ai/dsh-mcp-client` rows in the profile's
`cordis.patch.yml`. Edits are row-level YAML AST operations: comments, other plugins' rows and
`!!js` dynamic values all survive verbatim, and a `.bak-<ts>` backup is written first.
**Changes take effect on the next DSH start.**

`import_json` accepts Claude Code / Cursor style `{"mcpServers": {...}}` and converts `${VAR}`
into `!!js process.env.VAR`. DSH performs no client-side variable expansion, so an unconverted
value reaches the MCP server as the literal string `${GITHUB_TOKEN}` — and the failure surfaces
during remote authentication, far from its cause.

Write secrets as `!!js process.env.NAME`, never as plaintext.

### `workbench_plugin` — DSH plugins (local + marketplace)

`list` `install` `remove`(confirm) `update` `market_search` `market_install`

Install and remove forward to the `dsh plugin` CLI (itself a pnpm forwarder). This tool never
touches pnpm directly and never edits `dsh.profile.bundles` itself.

`list` separates two facts: `isBundle` says whether the package declares `dsh.bundle` — read
from **the copy actually installed on disk**, since a package can gain the declaration in a
newer version — and `active` says whether it joined the bundle layer. Both flags matter for
knowing whether an install really produced a plugin.

Local-path installs are checked first: a target without `dsh.bundle` is refused. Pointing at a
monorepo root instead of the plugin package is the usual cause, and pnpm would happily succeed
while reconciliation skips it, leaving "installed but nothing changed".

**Restart DSH for changes to take effect.**

## The sidebar

The plugin ships a web sidebar: a permanent 56px icon rail plus a content column that **belongs
to the sessions section only**. The active section is a filled block with an inverted icon.

There are six sections (sessions, employees, knowledge, skills, MCP, plugins), but the rail draws
**only those marked `visible` in `sections.ts`** — today that is sessions and skills. The other four
do not have finished surfaces yet, and an entry that leads to nothing but an explanation reads more
like breakage than an absence; their tools stay registered and the model can still use them, only
the entry is hidden. Finishing one means turning on its `visible` flag and nothing else.

Select anything but sessions and the content column does not render: the sidebar shrinks to that
rail and the domain's surface spans the full width from the rail's right edge. No narrow column
is kept because in those sections it could only hold a summary saying what the right-hand surface
already says — it costs usable width and makes you pick twice, once in the strip and once on the
right.

AppFrame's sidebar track still occupies whatever width the user dragged it to; the management
panel covers the leftover strip of empty sidebar (the overlay layer outranks the sidebar column).
The layout store is left alone on purpose: `ctx.layout` offers only `toggleSidebar()`, and
simulating "closed" with it would fight the user's own collapse state and might not restore.

It occupies ui-layout's `sidebar` slot, and **occupying is replacing**: the stock ui-sidebar
disappears along with every seat it declared. This plugin therefore re-declares and re-hosts
`sidebar.workspaces`, `sidebar.settings` and the rest with identical names, kinds and scopes,
so ui-workspace and ui-settings keep working unchanged. The sessions section hands its whole
body to ui-workspace.

`sidebar` is a `single` slot: two occupants do not error, they shadow each other by
registration order, which is not deterministic. `cordis.patch.yml` therefore disables the stock
`ui-sidebar`. Remove that row to keep the stock sidebar instead — but then which one renders
depends on plugin load order, which is not recommended.

## The management panel

Selecting any section other than sessions brings up that domain's management surface in the
main area; switching back to sessions removes it entirely and the conversation reappears
untouched.

**Skills** has a complete surface today: the list and the detail are not dialogs but an inline
surface covering the list, with a "back to list" control on top. Two pages — local inventory and
marketplace.

The detail is **two columns**: what this thing is on the left (title, description, tags, and an
overview/files pair of tabs), what state it is in on the right (source, path, visibility and the
rest, plus update and delete). Local skills and marketplace entries share the layout, because they
describe the same kind of thing and a second arrangement would mean learning where to look twice.

"Overview" **renders** the SKILL.md through the host's `MarkdownText` — the same renderer that draws
model replies in the conversation. Not pulling in a markdown stack of our own has two reasons: it is
already in the client loader's module table, so the plugin bundle does not grow for it; and, more to
the point, it is restrained about **untrusted content** (raw HTML and unsafe protocols are off), and
a marketplace SKILL.md is exactly that. A "source" toggle sits next to it: the model reads the raw
text, not the rendered result, so working out why a skill misbehaves means looking at the raw text.
A long body clips to 520px with a "show more" underneath.

"Files" is a **directory tree** — directories fold, files carry their size, SKILL.md sorts first.
Paths inside a skill package look like `references/api.md`, and a flat column of those does not show
what belongs together. Everything starts expanded: skill packages are small, and starting folded
would mean a page showing two or three directory names.

Clicking a file opens it right there: markdown goes through the same renderer as the body (with the
preview/source pair), anything else through the host's `CodeBlock`, syntax highlighting and copy
button included. Two things are stated rather than left blank — a **binary** file's bytes are never
sent to the browser (they would show nothing anyway), and anything over **256 KiB** arrives as its
opening slice with a note saying so. Marketplace files use the same dialog, served out of the package
just fetched: the gateway keeps **one** package (up to 8 MiB), so walking a tree does not re-download
the whole archive per file.

Which file gets read is decided by the browser, so there is a boundary here: a relative path is first
rejected literally for `..` and absolute forms, then, once resolved, **checked again** to confirm it
still sits under that skill directory. The first check alone is not enough — separators and drive
prefixes have more than one spelling per platform, and literal checks always leak one. That boundary,
along with "is it still text after truncation" (a cut through a multi-byte character makes the fatal
decoder call a Chinese document binary), is held by `tests/file-preview.test.mjs`.

The local tree lists the directory of the copy that is **actually in effect**, so a skill shipped
with the deployment shows its files too, not just the ones this plugin can change. One trap here:
`SkillView.path` does not mean the same thing in both projections — `projectLocal` gives
`<dir>/SKILL.md` while `projectWinner` gives the **directory**. So listing goes off `resourceBase`,
not `path`; and since a flat skill's (`<name>.md`) `resourceBase` is the skill *root*, listing that
would attribute every skill's files to this one — hence a directory only counts as a skill directory
when it actually holds a SKILL.md.

The local page has two entries: **upload** a ready-made skill archive (the common case) or
**create** a SKILL.md from scratch. Skills installed from a marketplace carry an "Installed vX" pill,
plus a "New vY" one when a newer version exists; the header has "Check for updates" and "Update all
(N)". **Both only apply to skills the ledger has an origin for** — a hand-written skill has no
upstream version, so stamping one on it invents a fact, and taking its name to a marketplace to find
some same-named entry would overwrite the user's own work with an unrelated package.

"Check for updates" is its own button rather than folded into "reload": it goes over the network to
every source, while reload is the most-pressed thing on this page and should not wait on a
marketplace round trip. Update-all lets one failure not stop the rest, and reports successes and
failures **separately** — saying "updated N" while swallowing the failures reads as "all of them
updated". Skills whose update could not be checked at all (source unreachable) get their own line;
otherwise the UI silently presents them as up to date, which is a quiet lie.

The marketplace side follows the same rule: "Installed vX" only appears on the entry the ledger
recognizes (same source, same slug); a mere name collision says "Name taken". Merging the two would
make "overwrite install" read like an update when it actually replaces a same-named skill from a
different origin. Switching to the marketplace loads the first page of entries
immediately rather than waiting for a search click — what people do on that page is look at what is
there, not arrive with a name already in mind.

A marketplace entry gets the same pair of tabs as a local skill: "overview" is the body of its
SKILL.md, "files" is what the package contains and how big each file is. Both come from **fetching
the package**, not from asking the marketplace for a listing: SkillHub has a set of
`/api/web/skills/.../files` endpoints, but they are not part of the ClawHub-compatible contract (the
same paths 404 on clawhub.ai), whereas the download endpoint is the one installing goes through
anyway — so what is listed is what you would actually get. When it cannot be fetched (mirror
entries, entries ClawHub forwards to GitHub, an unreachable source) both tabs say why instead of
raising a failure — someone is looking, not installing.

Below the search box sits a **label grouping** bar: pick one and only entries under it stay. It has
two possible sources, and only one of them is ever shown:

- **The marketplace's own label catalog** (SkillHub's `/api/web/labels`). Where it exists, filtering
  by label happens **server-side** and covers the whole marketplace rather than the current page —
  the internal deployment carries a custom set (`skillhub`, `5g-dpi`, `aiintelligence` and friends),
  and picking one returns every match in the catalog. Labels belong to a specific source, so the
  filter only queries the source that owns the label: handing one source's label to another either
  404s or gets ignored, and the second case returns a full page of unfiltered results that looks
  filtered — worse than an error.
- **Categories counted from the batch already loaded** (each entry's own `topics`). Used only when a
  source offers no label catalog, with a line underneath stating the scope so "only three under this
  category" is not read as "only three in the whole marketplace".

With neither available the whole bar is absent rather than an empty shell holding only "All". Like
the file listing, `/api/web/labels` is not part of the ClawHub-compatible contract (it 404s on
clawhub.ai), so this is best-effort detection: no catalog means the source simply has no labels.

Label filtering goes through `/api/web/skills`, whose entries are shaped unlike either `/api/v1`
route — display name and summary each have a Chinese variant, the version lives under
`headlineVersion`, the statistics use different field names — so it gets its own normalizer. A side
benefit is that filtered cards show the Chinese display name. **`namespace` is not a publisher**: it
is a namespace like `global`, and treating it as the owner would print "published by global" on the
card and attach a coordinate upstream does not recognize to the download.

The **AI employees** surface (a list plus a six-page editor) still exists in the code; only its
entry is hidden for now, see "The sidebar" above. Knowledge, MCP and plugins still have explanatory
surfaces only. All four domains' tools stay registered and usable by the model.

Everything on screen is real local state: employees come from `ctx.agentPresets`, bindings from
the `employee.yml` inside each preset directory, persona and tools are parsed out of the agent
composition; the skill list merges `ctx.skills` with `$DSH_HOME/skills`. An employee shipped with
the deployment (`trust` other than `user`), and any skill outside the user directory, are
read-only in the UI — the same rule the tool enforces.

### Four things the skills domain must not paper over

**Shadowing.** `ctx.skills` answers "what can the model use right now" (rank and same-name
shadowing included); the user directory answers "what can this plugin change". When both hold a
name, the higher-priority source wins and the copy on disk stays there without taking effect. The
UI marks it shadowed and puts a banner at the top of the detail view saying that editing it
changes nothing — not an easily missed badge.

**Rejection by DSH.** Skill frontmatter has a few unforgiving rules: `name` is required and must
be kebab-case, and the two visibility switches must use the hyphenated spelling
(`disable-model-invocation`, `user-invocable`). Camel-case spellings make DSH **throw and discard
the whole skill**. Packages from the Claude Code ecosystem use the camel-case form often enough
that this matters: installed, everything looks fine, and the model never sees the skill. So this
plugin mirrors DSH's parsing rule for rule, lists those files separately, and names the exact key
to change.

**Whether a write actually took effect.** This used to say "takes effect after restarting DSH".
Checked against upstream source, that is wrong, and it costs the reader a pointless restart. The
real chain: `dsh-skill-filesystem` watches the skill roots with chokidar and calls
`control.invalidate()` about 200ms after a write; that callback clears the entire registry's
discovery cache and broadcasts `skills/change`. `dsh-tool-skill` re-snapshots on **every**
`agent/pre-step` and appends a replacement catalog when the digest changes. The user's `/name`
path is even more direct — it looks up `ctx.skills.get(name)` each time, and full definitions are
never cached. **Write to disk, and the next model turn has it.**

This plugin adds two things on top: it registers a provider on `ctx.skills` that produces no
skills at all, purely to obtain the invalidation handle, and rings it after each write (which
holds even when the watcher is disabled or cannot start); then it re-reads `ctx.skills` and
hands back whether that name resolves and whether the winner is the copy it just wrote.

One thing about that read-back has to be stated, or the verdict lies: `ctx.skills` is a
host-plus-per-scope layered registry, and this plugin sits in the **host** layer, on an unscoped
context. **The web profile's shipped composition disables the host `skill-filesystem` row**, moving
local discovery into each agent preset's own layer (`packages/bundle/web-app/cordis.patch.yml`
states the reason: presets own local discovery). Seen from here, nothing under `$DSH_HOME/skills`
resolves at all — while the agent in a session uses those skills perfectly well. So "not found" is
split into three distinct answers: this file was rejected (naming the exact key), the host layer
does not scan this root at all (a scope fact, not a failure), and neither of those (say so plainly
and point at DSH's log). In a headless profile the host mounts `skill-filesystem` itself, and the
read-back is directly meaningful.

**What is actually inside the package.** A skill is a set of instructions the model will follow,
so it is worth a look before installing. Both detail views — local and marketplace — carry a
"security scan" tab: thirteen regex rules plus one charset-smuggling check (text that is valid
UTF-8 on disk but reveals different content when re-decoded through UTF-16 was almost certainly
hidden on purpose). The rule table and the decoder check are ported from the skill-scan pre-scan
in Tencent Zhuque Lab's [AI-Infra-Guard](https://github.com/Tencent/AI-Infra-Guard)
(Apache License 2.0); the internal SkillHub runs the same rules in Java as a pre-publish check,
so both ends say the same thing about the same package.

The tab deliberately shows **no red/green verdict**. A match only means the text looks like a
high-risk pattern, not that the skill does it — `crontab` in a doc about scheduled tasks is
perfectly normal, and a red-team skill's jailbreak corpus is naturally full of prompt injection.
So it lists which rule matched in which file at which line, and clicking a row opens that file.
The reverse holds too: no match does not mean safe, there are only thirteen rules.

### What an employee is

An AI employee is not a name card but a directly-conversable agent template assembled from a
**persona, tools, skills, MCP servers and knowledge bases**. The name card (`preset.yml`) holds
only a display name and a description; what the employee can actually do is decided by
`agent.cordis.yml` — an array of cordis loader entries, one plugin per row, nestable through
`cordis:group`.

The UI therefore **parses** that file ([`employee/composition.ts`](src/employee/composition.ts))
rather than keeping a second record of its own: a second record would start diverging
immediately, and the composition is the only thing that decides. That is what makes the four
built-in modes legible at a glance — `minimal` is two tool plugins and one fixed system prompt,
`standard` is seventeen tool plugins with skills and AGENTS.md, `cordis` is that plus one.

Three things the UI states plainly, recorded here too:

- **Classification is a package-name-prefix heuristic**, not a DSH-sanctioned taxonomy. DSH does
  not mark a plugin as "a tool"; naming convention (`dsh-tool-*` / `dsh-skill*` / `dsh-mcp*`) is
  all there is. Rows that cannot be classified are listed verbatim under "other rows" instead of
  being guessed at.
- **A tool row is not a tool name.** One `dsh-tool-fs` row registers several file operations; the
  actual tool names are decided at runtime. What the UI shows is which tool plugins are composed.
- **A `!!js` `disabled` expression is shown verbatim** (a per-platform condition, say). Whether it
  actually disables the row depends on the runtime, so the UI does not decide that for it.

The two "personas" are two separate blocks in the UI because they are not the same thing: the
**system prompt** in the composition's `dsh-persona` row decides who this agent is when it
speaks (read-only — changing it means editing the composition), while the **role** the workbench
stores in `employee.yml` is an added layer describing what this employee is responsible for.
Calling the latter "the persona" would suggest editing it changes the system prompt. It does not.

For the same reason the skills and MCP pages first state whether the template **supports** that
kind of resource at all, before offering the binding list: `minimal` composes no skill support,
so binding skills to it writes the binding but leaves the model with no tool to invoke them.

The model sees this too: `workbench_employee`'s list output carries a "composition" line, read
from the same projection ([`employee/view.ts`](src/employee/view.ts)) the UI uses.

### Which slot it occupies

The panel occupies `shell.overlay` (a `list` slot, the frame-wide floating layer) and **not**
`conversation`. The latter is `single` and occupied by ui-conversation; taking it would mean
rewriting the entire conversation surface. A `list` slot displaces nobody. The cost is that the
overlay layer covers the whole frame, so the panel has to step aside for the sidebar column —
its width is published by the sidebar into a store both share (the sidebar and the panel are
two non-adjacent React trees, so context cannot reach across).

### The data channel

A browser reads local files through exactly one supported path: a Typert Remote. This package's
Node half registers `WorkbenchEmployeeGateway` as `ctx.workbenchEmployee`, and its `@Remote`
methods surface as `ctx.remote.workbenchEmployee.*` through api-gateway — the same mechanism
DSH's own `ui-settings-plugin-inventory` uses to read the plugin roster.

Two things are worth their own note; read them before changing this area:

- **`src/typert-schemas.ts` is handwritten.** DSH generates its equivalents with
  `@deepseek-ai/dsh-typert-generator`, which discovers packages through the harness workspace
  layout and cannot run for an out-of-tree plugin. The loader only cares about the `./typert`
  export in `package.json` and the shape of `TYPERT`, so this package writes that artifact
  contract by hand. **The cost**: these schemas have no compile-time link to the types in
  `employee/remote.ts`. Change a method signature and nothing fails to compile — it fails at
  runtime against the gateway's strict codec check. Change one, change the other.
- **The Node half builds from JS emitted by `tsc`, not from `.ts` sources.** The `@Remote`
  decorators must be transpiled into runtime code; the oxc transform underneath tsdown emits
  decorator syntax verbatim, which Node rejects on load. Hence `build` is `tsc -b && tsdown`,
  with the intermediate output in `.tsbuild/`.

Writing that table by hand carries two more rules you only learn by tripping over them:

- **No method may be named `remove`.** In the browser each namespace is a Service and `remove`
  already lives on its prototype; the collision is rejected at `$mount`. Both domains call their
  deletion method `delete`.
- **Optional parameters need `acceptsUndefined: true`.** The api-gateway matches argument names
  against the descriptor literally, and `undefined` does not exist in JSON — passing an undefined
  optional argument reads as "a field is missing" and the whole call is rejected. Writing
  `.optional()` on the schema does not cover this; the switch lives on the parameter
  descriptor.

Also: a Remote method cannot be named `remove`. Each browser-side namespace is a Service whose
prototype already carries `remove`, and the clash is refused at `$mount`. The employee domain's
method is called `delete`.

## Where data lives

```
$DSH_HOME/
├── skills/<name>/SKILL.md              skills (DSH's own user-level skill root)
├── workbench/skills.json               install ledger for marketplace skills (update checks read it)
├── workbench/staging/                  install staging, deliberately outside the skill root
├── profiles/<profile>/cordis.patch.yml MCP servers (DSH's own profile patch layer)
├── .agent-presets/<id>/                AI employees (DSH's own preset root)
│   ├── agent.cordis.yml                  composition, owned by DSH
│   ├── preset.yml                        display metadata, owned by DSH
│   └── employee.yml                      resource bindings, added by this plugin
└── workbench/
    ├── knowledge/<kb-id>/
    │   ├── kb.json                       metadata and chunking parameters
    │   ├── documents/<doc-id>.<ext>      source documents
    │   └── index.json                    chunk bodies and term frequencies
    └── cache/                            offline cache of marketplace results
```

Everything is owner-only (`0600` / `0700`): patch files and knowledge bases can hold tokens or
internal company content.

## Deliberately out of scope

- **Vector retrieval.** DSH exposes no embedding seam; pretending otherwise would be worse than
  saying so.
- **PDF / Office parsing.** No heavyweight dependencies up front — convert to text first.
- **Bypassing the preset copy boundary.** `ctx.agentPresets` allows whole-directory copying
  only, and that is a deliberate security design.

## Development

```bash
pnpm install
pnpm build        # both halves: lib/index.js for the host, lib/client.js for the browser
pnpm typecheck    # tsc -b
pnpm test         # node --test
```

The client bundle cannot use DSH's own client preset — it globs the harness repository for
packages by name, and an out-of-tree plugin is not there. `tsdown.client.ts` reimplements the
same artifact contract: the `__ModuleLoader__.load` closure, CJS on `platform: browser`, a fixed
`client.js` name, CSS modules compiled through lightningcss, and externals restricted to the
loader module table.

After changing that config, verify the artifact:

```bash
grep -o 'require("[^"]*")' lib/client.js | sort -u
```

Only module-table specifiers should appear. Anything else is a `require` that throws at runtime.
