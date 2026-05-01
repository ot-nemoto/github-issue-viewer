import type { GitHubItem } from "@/types";
import { IssueItem } from "./IssueItem";

type IssueListProps = {
  items: GitHubItem[];
};

export function IssueList({ items }: IssueListProps) {
  if (items.length === 0) {
    return (
      <div className="py-12 text-center text-gray-500 text-sm">
        該当するアイテムがありません
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {items.map((item) => (
        <IssueItem key={`${item.kind}-${item.id}`} item={item} />
      ))}
    </div>
  );
}
