"use client";

export type FilterState = {
  type: "all" | "issue" | "pull_request";
  status: "all" | "open" | "closed";
  repos: string[];
  labels: string[];
};

type FilterBarProps = {
  filter: FilterState;
  availableRepos: string[];
  availableLabels: string[];
  onChange: (filter: FilterState) => void;
};

export function FilterBar({
  filter,
  availableRepos,
  availableLabels,
  onChange,
}: FilterBarProps) {
  const typeOptions: { value: FilterState["type"]; label: string }[] = [
    { value: "all", label: "すべて" },
    { value: "issue", label: "Issue" },
    { value: "pull_request", label: "PR" },
  ];

  const statusOptions: { value: FilterState["status"]; label: string }[] = [
    { value: "all", label: "すべて" },
    { value: "open", label: "Open" },
    { value: "closed", label: "Closed" },
  ];

  const toggleRepo = (repo: string) => {
    const next = filter.repos.includes(repo)
      ? filter.repos.filter((r) => r !== repo)
      : [...filter.repos, repo];
    onChange({ ...filter, repos: next });
  };

  const toggleLabel = (label: string) => {
    const next = filter.labels.includes(label)
      ? filter.labels.filter((l) => l !== label)
      : [...filter.labels, label];
    onChange({ ...filter, labels: next });
  };

  return (
    <div className="flex flex-wrap gap-4 items-center py-3 px-4 bg-gray-50 border border-gray-200 rounded-lg">
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 font-medium">タイプ</span>
        <div className="flex rounded overflow-hidden border border-gray-300">
          {typeOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              aria-pressed={filter.type === opt.value}
              onClick={() => onChange({ ...filter, type: opt.value })}
              className={`px-3 py-1 text-xs ${
                filter.type === opt.value
                  ? "bg-gray-800 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 font-medium">ステータス</span>
        <div className="flex rounded overflow-hidden border border-gray-300">
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              aria-pressed={filter.status === opt.value}
              onClick={() => onChange({ ...filter, status: opt.value })}
              className={`px-3 py-1 text-xs ${
                filter.status === opt.value
                  ? "bg-gray-800 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {availableRepos.length > 1 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-500 font-medium">リポジトリ</span>
          {availableRepos.map((repo) => (
            <button
              key={repo}
              type="button"
              aria-pressed={
                filter.repos.length === 0 || filter.repos.includes(repo)
              }
              onClick={() => toggleRepo(repo)}
              className={`px-2 py-1 text-xs rounded border ${
                filter.repos.length === 0 || filter.repos.includes(repo)
                  ? "bg-gray-800 text-white border-gray-800"
                  : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {repo}
            </button>
          ))}
        </div>
      )}

      {availableLabels.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-500 font-medium">ラベル</span>
          {availableLabels.map((label) => (
            <button
              key={label}
              type="button"
              aria-pressed={
                filter.labels.length === 0 || filter.labels.includes(label)
              }
              onClick={() => toggleLabel(label)}
              className={`px-2 py-1 text-xs rounded border ${
                filter.labels.length === 0 || filter.labels.includes(label)
                  ? "bg-gray-800 text-white border-gray-800"
                  : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
