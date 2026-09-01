import Icon from "./Icon";

export default function EmptyState({ title, body, icon = "search" }) {
  return (
    <div className="text-center py-12 px-6">
      <div className="mx-auto h-12 w-12 rounded-full bg-brass-tint border border-brass/30 flex items-center justify-center text-brass mb-3">
        <Icon name={icon} className="h-5 w-5" />
      </div>
      <p className="font-medium text-ink">{title}</p>
      <p className="text-sm text-muted mt-1 max-w-sm mx-auto">{body}</p>
    </div>
  );
}
