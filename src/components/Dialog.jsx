import { useEffect } from "react";
import "../css/Dialog.css";

export default function Dialog({ isOpen, onClose, title, message, type = "info", onConfirm, confirmText = "OK", cancelText = "Cancel", showCancel = false }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <div className="dialog-backdrop" onClick={handleCancel}>
      <div className={`dialog-box dialog-${type}`} onClick={(e) => e.stopPropagation()}>
        <button className="dialog-close" onClick={handleCancel}>×</button>
        <div className="dialog-icon">
          {type === "success" && "✓"}
          {type === "error" && "✗"}
          {type === "warning" && "⚠"}
          {type === "info" && "ℹ"}
          {type === "confirm" && "?"}
        </div>
        {title && <h3 className="dialog-title">{title}</h3>}
        <p className="dialog-message">{message}</p>
        <div className="dialog-actions">
          {showCancel && (
            <button className="dialog-btn dialog-btn-cancel" onClick={handleCancel}>
              {cancelText}
            </button>
          )}
          <button className={`dialog-btn dialog-btn-${type}`} onClick={handleConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

