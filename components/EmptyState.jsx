import Icon from "./Icon";

export default function EmptyState({ title, body, icon = "search" }) {
  return (
    <div className="text-center py-12 px-6">
      <div className="mx-auto h-11 w-11 rounded-full bg-paper border border-line flex items-center justify-center text-muted mb-3">
        <Icon name={icon} className="h-5 w-5" />
      </div>
      <p className="font-medium text-ink">{title}</p>
      <p className="text-sm text-muted mt-1 max-w-sm mx-auto">{body}</p>
    </div>
  );
}
