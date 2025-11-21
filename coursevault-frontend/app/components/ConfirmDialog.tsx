interface ConfirmDialogProps {
  open: boolean;
  title: string;
  desc: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({ open, title, desc, onConfirm, onCancel }: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white p-6 rounded shadow w-96">
        <h2>{title}</h2>
        <p>{desc}</p>
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onCancel}>Cancel</button>
          <button onClick={onConfirm}>Confirm</button>
        </div>
      </div>
    </div>
  );
}
