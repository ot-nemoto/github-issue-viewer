import { parseRelatedIssues } from "@/lib/github/parser";
import { getLabelColor } from "@/lib/labelColor";
import type { GitHubItem } from "@/types";
import { Badge } from "../ui/Badge";

const MAX_LABELS = 3;

function formatDate(iso: string): string {
  return iso.slice(0, 10);
}

function IssueIcon({ item }: { item: GitHubItem }) {
  if (item.kind === "pull_request") {
    if (item.merged_at) {
      // PR merged
      return (
        <svg
          width="18"
          height="18"
          viewBox="0 0 16 16"
          fill="#8250df"
          role="img"
          aria-label="Merged pull request"
        >
          <path d="M5.45 5.154A4.25 4.25 0 0 0 9.25 9.25v2.451a2.25 2.25 0 1 0 1.5 0V9.25A5.75 5.75 0 0 1 4.96 3.849L6.077 4.966a.25.25 0 0 0 .427-.177V2.343a.25.25 0 0 0-.427-.177L3.85 4.393a.25.25 0 0 0 .177.427h.002l1.421-.666ZM3.75 2.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm0 9.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm8.25.75a.75.75 0 1 0 1.5 0 .75.75 0 0 0-1.5 0Z" />
        </svg>
      );
    }
    if (item.state === "closed") {
      // PR closed (not merged)
      return (
        <svg
          width="18"
          height="18"
          viewBox="0 0 16 16"
          fill="#636c76"
          role="img"
          aria-label="Closed pull request"
        >
          <path d="M3.25 1A2.25 2.25 0 0 1 4 5.372v5.256a2.251 2.251 0 1 1-1.5 0V5.372A2.25 2.25 0 0 1 3.25 1Zm9.5 5.5a.75.75 0 0 1 .75.75v3.378a2.251 2.251 0 1 1-1.5 0V7.25a.75.75 0 0 1 .75-.75Zm-2.03-5.273a.75.75 0 0 1 1.06 0l.97.97.97-.97a.748.748 0 0 1 1.265.332.75.75 0 0 1-.205.729l-.97.97.97.97a.751.751 0 0 1-.018 1.042.751.751 0 0 1-1.042.018l-.97-.97-.97.97a.749.749 0 0 1-1.275-.326.749.749 0 0 1 .215-.734l.97-.97-.97-.97a.75.75 0 0 1 0-1.06ZM3.25 2.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm0 9.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm9.5 0a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Z" />
        </svg>
      );
    }
    // PR open
    return (
      <svg
        width="18"
        height="18"
        viewBox="0 0 16 16"
        fill="#1a7f37"
        role="img"
        aria-label="Open pull request"
      >
        <path d="M1.5 3.25a2.25 2.25 0 1 1 3 2.122v5.256a2.251 2.251 0 1 1-1.5 0V5.372A2.25 2.25 0 0 1 1.5 3.25Zm5.677-.177L9.573.677A.25.25 0 0 1 10 .854V2.5h1A2.5 2.5 0 0 1 13.5 5v5.628a2.251 2.251 0 1 1-1.5 0V5a1 1 0 0 0-1-1h-1v1.646a.25.25 0 0 1-.427.177L7.177 3.427a.25.25 0 0 1 0-.354ZM3.75 2.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm0 9.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm8.25.75a.75.75 0 1 0 1.5 0 .75.75 0 0 0-1.5 0Z" />
      </svg>
    );
  }

  if (item.state === "closed") {
    // Issue closed
    return (
      <svg
        width="18"
        height="18"
        viewBox="0 0 16 16"
        fill="#cf222e"
        role="img"
        aria-label="Closed issue"
      >
        <path d="M11.28 6.78a.75.75 0 0 0-1.06-1.06L7.25 8.69 5.78 7.22a.75.75 0 0 0-1.06 1.06l2 2a.75.75 0 0 0 1.06 0l3.5-3.5Z" />
        <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0Zm-1.5 0a6.5 6.5 0 1 0-13 0 6.5 6.5 0 0 0 13 0Z" />
      </svg>
    );
  }

  // Issue open
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 16 16"
      fill="#1a7f37"
      role="img"
      aria-label="Open issue"
    >
      <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
      <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Z" />
    </svg>
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
  const labels = item.labels ?? [];
  const visibleLabels = labels.slice(0, MAX_LABELS);
  const extraCount = labels.length - MAX_LABELS;
  const relatedIssues =
    item.kind === "pull_request" ? parseRelatedIssues(item.body) : [];

  return (
    <div className="flex gap-3 py-3 px-4 border-b border-[#d0d7de] hover:bg-[#f6f8fa] last:border-b-0 transition-colors">
      <div className="mt-0.5 shrink-0">
        <IssueIcon item={item} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="text-xs text-[#8c959f] shrink-0">
            #{item.number}
          </span>
          <a
            href={item.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-[#1f2328] hover:text-[#0969da] hover:underline truncate"
          >
            {item.title}
          </a>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
          <StatusBadge item={item} />
          {visibleLabels.map((label) => (
            <Badge key={label.id} color={getLabelColor(label.name)}>
              {label.name}
            </Badge>
          ))}
          {extraCount > 0 && (
            <span className="text-xs text-[#636c76]">+{extraCount}</span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1.5 text-xs text-[#636c76]">
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
