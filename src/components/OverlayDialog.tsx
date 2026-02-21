interface OverlayDialogProps {
  open: boolean;
  title: string;
  message: string;
  detail?: string;
  highlight?: boolean;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
}

export function OverlayDialog({
  open,
  title,
  message,
  detail,
  highlight,
  primaryActionLabel,
  onPrimaryAction,
}: OverlayDialogProps) {
  if (!open) return null;

  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-live="assertive">
      <div className={`overlay-card ${highlight ? "overlay-card--highlight" : ""}`}>
        <h2>{title}</h2>
        <p>{message}</p>
        {detail ? <p className="overlay-detail">{detail}</p> : null}
        {primaryActionLabel && onPrimaryAction ? (
          <button className="btn" onClick={onPrimaryAction}>
            {primaryActionLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
}
