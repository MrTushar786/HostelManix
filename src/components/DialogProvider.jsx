import { useState, useEffect } from "react";
import Dialog from "./Dialog";

let dialogState = null;
const listeners = new Set();

export const showDialog = (config) => {
  const id = Date.now();
  const dialog = {
    id,
    isOpen: true,
    ...config
  };
  dialogState = dialog;
  listeners.forEach(listener => listener(dialog));
  return id;
};

export const hideDialog = () => {
  dialogState = null;
  listeners.forEach(listener => listener(null));
};

export const DialogProvider = () => {
  const [dialog, setDialog] = useState(null);

  useEffect(() => {
    const listener = (newDialog) => {
      setDialog(newDialog);
    };
    listeners.add(listener);
    if (dialogState) {
      setDialog(dialogState);
    }
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const handleClose = () => {
    if (dialog?.onClose) {
      dialog.onClose();
    }
    hideDialog();
  };

  const handleConfirm = () => {
    if (dialog?.onConfirm) {
      dialog.onConfirm();
    }
    hideDialog();
  };

  if (!dialog) return null;

  return (
    <Dialog
      isOpen={dialog.isOpen}
      onClose={handleClose}
      title={dialog.title}
      message={dialog.message}
      type={dialog.type || "info"}
      onConfirm={handleConfirm}
      confirmText={dialog.confirmText || "OK"}
      cancelText={dialog.cancelText || "Cancel"}
      showCancel={dialog.showCancel || false}
    />
  );
};

// Helper functions
export const showConfirm = (message, onConfirm, title = "Confirm") => {
  return showDialog({
    type: "confirm",
    title,
    message,
    showCancel: true,
    onConfirm,
    confirmText: "Confirm",
    cancelText: "Cancel"
  });
};

export const showAlert = (message, type = "info", title = null) => {
  const defaultTitles = {
    error: "Error",
    success: "Success",
    warning: "Warning",
    info: "Information"
  };
  return showDialog({
    type,
    title: title || defaultTitles[type] || "Information",
    message,
    showCancel: false,
    confirmText: "OK"
  });
};

export const showError = (message, title = "Error") => {
  return showAlert(message, "error", title);
};

export const showSuccess = (message, title = "Success") => {
  return showAlert(message, "success", title);
};

export const showWarning = (message, title = "Warning") => {
  return showAlert(message, "warning", title);
};

