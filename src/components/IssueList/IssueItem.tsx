import { parseRelatedIssues } from "@/lib/github/parser";
import type { GitHubItem } from "@/types";
import { Badge } from "../ui/Badge";

const MAX_LABELS = 3;

function formatDate(iso: string): string {
  return iso.slice(0, 10);
}

function IssueIcon({ item }: { item: GitHubItem }) {
  if (item.kind === "pull_request") {
    const merged = item.merged_at !== null;
    const color = merged
      ? "text-purple-600"
      : item.state === "open"
        ? "text-green-600"
        : "text-gray-500";
    return (
      <span className={`text-lg leading-none select-none ${color}`} aria-hidden>
        ⊕
      </span>
    );
  }
  const color = item.state === "open" ? "text-green-600" : "text-red-600";
  return (
    <span className={`text-lg leading-none select-none ${color}`} aria-hidden>
      ⊙
    </span>
  );
}

function StatusBadge({ item }: { item: GitHubItem }) {
  if (item.kind === "pull_request" && item.merged_at) {
    return <Badge variant="merged">merged</Badge>;
  }
  if (item.state === "open") {
    return <Badge variant="open">open</Badge>;
  }
  return <Badge variant="closed">closed</Badge>;
}

type IssueItemProps = {
  item: GitHubItem;
};

export function IssueItem({ item }: IssueItemProps) {
  const repo = item.repo;
  const labels = item.labels ?? [];
  const visibleLabels = labels.slice(0, MAX_LABELS);
  const extraCount = labels.length - MAX_LABELS;
  const relatedIssues =
    item.kind === "pull_request" ? parseRelatedIssues(item.body) : [];

  return (
    <div className="flex gap-3 py-3 px-4 border-b border-gray-200 hover:bg-gray-50 last:border-b-0">
      <div className="mt-0.5 shrink-0">
        <IssueIcon item={item} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="text-xs text-gray-500 shrink-0">{repo}</span>
          <span className="text-xs text-gray-400 shrink-0">#{item.number}</span>
          <a
            href={item.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-gray-900 hover:text-blue-600 hover:underline truncate"
          >
            {item.title}
          </a>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
          <StatusBadge item={item} />
          {visibleLabels.map((label) => (
            <Badge key={label.id} color={label.color}>
              {label.name}
            </Badge>
          ))}
          {extraCount > 0 && (
            <span className="text-xs text-gray-400">+{extraCount}</span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1.5 text-xs text-gray-400">
          <span>作成: {formatDate(item.created_at)}</span>
          <span>更新: {formatDate(item.updated_at)}</span>
          {relatedIssues.length > 0 && (
            <span>
              関連:{" "}
              {relatedIssues.map((n, i) => (
                <span key={n}>
                  {i > 0 && " "}#{n}
                </span>
              ))}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
