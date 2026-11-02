// Builds src/data/roadmap.json from the Breadslicer project board.
//
//   node scripts/export-roadmap.mjs
//
// Reads the board with the GitHub CLI (`gh api graphql`), so it uses whatever
// `gh` is signed in as, or GH_TOKEN when set (the workflow does that). The
// slicer repository is private: only these public, number-less fields leave it:
// the title (without its "BS-<n>: " prefix), open or closed, the board column,
// the labels and the date it was closed. Never bodies, comments, numbers, links
// or people.
//
// Safety filter: an issue labelled `private`, or whose title contains a blocked
// word (see BLOCKED_WORD_HASHES), is left out entirely.

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ORG = process.env.ROADMAP_ORG ?? "breadslicer-app";
const PROJECT = Number(process.env.ROADMAP_PROJECT ?? 1);
const REPO = process.env.ROADMAP_REPO ?? "breadslicer-app/breadslicer";
const COLUMNS = ["In progress", "Next", "Quick wins", "Backlog", "Later", "Done"];

// Words that keep an issue off the public roadmap, compared word by word, any
// case. They are stored as the first 16 hex digits of their SHA-256 so that this
// public file does not spell them out. To get the value for a new word:
//   node scripts/export-roadmap.mjs --hash <word>
// More words can be added at run time, in plain text, with
//   ROADMAP_EXTRA_BLOCKED="word1,word2"
const BLOCKED_WORD_HASHES = new Set([
  "7d9f72f6de608982", "c857d09db23e6822", "32e83e92d45d71f6", "d4f0bc5a29de06b5",
  "8c70b25cbbbe8e79", "c70eca6b0f88f44d", "7d3194f79e645c42", "053ea4804ef1bb33",
  "5e14fbe0b3af2ed9", "ee510d1a07ac7e64", "1f2075abe2e678d6", "32c220482c68413f",
  "4bff358ac1b68f22", "e0c924608fdcda85", "bead4435bace442e", "69b21112c1551f98",
  "b8b6bf33efcb9144", "58783b218b78dfcf", "7063d51d1b2da165", "9b365fea51e6a690",
  "60965168ce762e94", "487b91042c7cf27a", "3ea125d0bff386e6", "5d72436256ada538",
]);
const hashWord = (w) => createHash("sha256").update(w.toLowerCase()).digest("hex").slice(0, 16);
for (const w of (process.env.ROADMAP_EXTRA_BLOCKED ?? "").split(",")) if (w.trim()) BLOCKED_WORD_HASHES.add(hashWord(w.trim()));
if (process.argv[2] === "--hash") {
  console.log(hashWord(process.argv[3] ?? ""));
  process.exit(0);
}
const blocked = { test: (title) => title.toLowerCase().split(/[^a-z0-9]+/).some((w) => w && BLOCKED_WORD_HASHES.has(hashWord(w))) };
const PRIVATE_LABEL = "private";

const QUERY = `
query($org: String!, $num: Int!, $cursor: String) {
  organization(login: $org) {
    projectV2(number: $num) {
      items(first: 100, after: $cursor) {
        pageInfo { hasNextPage endCursor }
        nodes {
          status: fieldValueByName(name: "Status") {
            ... on ProjectV2ItemFieldSingleSelectValue { name }
          }
          content {
            __typename
            ... on Issue {
              title
              state
              closedAt
              repository { nameWithOwner }
              labels(first: 30) { nodes { name } }
            }
          }
        }
      }
    }
  }
}`;

function page(cursor) {
  const args = ["api", "graphql", "-f", `query=${QUERY}`, "-F", `org=${ORG}`, "-F", `num=${PROJECT}`];
  if (cursor) args.push("-F", `cursor=${cursor}`);
  const raw = execFileSync("gh", args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  const data = JSON.parse(raw);
  const items = data?.data?.organization?.projectV2?.items;
  if (!items) throw new Error("The project board could not be read (check the token's access to the project).");
  return items;
}

const nodes = [];
let cursor = null;
do {
  const items = page(cursor);
  nodes.push(...items.nodes);
  cursor = items.pageInfo.hasNextPage ? items.pageInfo.endCursor : null;
} while (cursor);

let skipped = 0;
const items = [];
for (const node of nodes) {
  const issue = node.content;
  if (!issue || issue.__typename !== "Issue") continue;
  if (issue.repository?.nameWithOwner !== REPO) continue;
  const labels = (issue.labels?.nodes ?? []).map((l) => l.name);
  const title = issue.title.replace(/^\s*BS-\d+\s*:\s*/i, "").trim();
  if (labels.some((l) => l.toLowerCase() === PRIVATE_LABEL) || blocked.test(title)) {
    skipped++;
    continue;
  }
  const column = COLUMNS.includes(node.status?.name) ? node.status.name : "Backlog";
  items.push({
    title,
    state: issue.state === "CLOSED" ? "closed" : "open",
    column,
    labels: labels.filter((l) => !/^state:/i.test(l)),
    closed: issue.closedAt ? issue.closedAt.slice(0, 10) : null,
  });
}

const out = {
  generated: new Date().toISOString().slice(0, 19) + "Z",
  columns: COLUMNS,
  counts: Object.fromEntries(COLUMNS.map((c) => [c, items.filter((i) => i.column === c).length])),
  items,
};
const target = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "data", "roadmap.json");
writeFileSync(target, JSON.stringify(out, null, 1) + "\n");
console.log(`${items.length} issues written, ${skipped} left out by the safety filter -> ${target}`);
console.log(out.counts);
