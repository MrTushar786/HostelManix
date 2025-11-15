// Dialog utility - provides a simple way to show dialogs
let dialogState = null;
let dialogListeners = new Set();

export const useDialog = () => {
  const [dialog, setDialog] = useState(null);

  useEffect(() => {
    const listener = (newDialog) => {
      setDialog(newDialog);
    };
    dialogListeners.add(listener);
    return () => {
      dialogListeners.delete(listener);
    };
  }, []);

  const showDialog = (config) => {
    const newDialog = {
      id: Date.now(),
      ...config,
      isOpen: true
    };
    dialogState = newDialog;
    dialogListeners.forEach(listener => listener(newDialog));
    return newDialog.id;
  };

  const hideDialog = () => {
    dialogState = null;
    dialogListeners.forEach(listener => listener(null));
  };

  return { dialog, showDialog, hideDialog };
};

// Simple dialog functions for use without hooks
export const showConfirmDialog = (message, onConfirm, title = "Confirm") => {
  const id = Date.now();
  const dialog = {
    id,
    isOpen: true,
    type: "confirm",
    title,
    message,
    showCancel: true,
    onConfirm: () => {
      onConfirm();
      hideDialogById(id);
    },
    onClose: () => hideDialogById(id)
  };
  dialogState = dialog;
  dialogListeners.forEach(listener => listener(dialog));
  return id;
};

export const showAlertDialog = (message, type = "info", title = null) => {
  const id = Date.now();
  const dialog = {
    id,
    isOpen: true,
    type,
    title: title || (type === "error" ? "Error" : type === "success" ? "Success" : type === "warning" ? "Warning" : "Information"),
    message,
    showCancel: false,
    onClose: () => hideDialogById(id)
  };
  dialogState = dialog;
  dialogListeners.forEach(listener => listener(dialog));
  return id;
};

const hideDialogById = (id) => {
  if (dialogState?.id === id) {
    dialogState = null;
    dialogListeners.forEach(listener => listener(null));
  }
};

