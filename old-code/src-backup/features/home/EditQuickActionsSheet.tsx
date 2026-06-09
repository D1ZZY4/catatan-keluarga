import React, { useState } from "react";
import { Check, GripVertical, Plus, Trash2, X } from "lucide-react";
import { BottomSheet } from "@/shared/components/BottomSheet";
import { DynamicIcon } from "@/shared/components/DynamicIcon";
import { cn } from "@/shared/utils/misc";
import {
  AVAILABLE_QUICK_ACTION_TYPES,
  DEFAULT_QUICK_ACTIONS,
  QUICK_ACTION_META,
  type QuickActionConfig,
  type QuickActionType,
} from "./quickActionsConfig";
import { useQuickActions } from "./useQuickActions";

interface EditQuickActionsSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

function genId() {
  return `qa_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export function EditQuickActionsSheet({
  isOpen,
  onClose,
}: EditQuickActionsSheetProps) {
  const { actions, saveActions } = useQuickActions();
  const [draft, setDraft] = useState<QuickActionConfig[]>(actions);
  const [addMode, setAddMode] = useState(false);

  const syncDraft = () => {
    setDraft(actions);
    setAddMode(false);
  };

  const handleOpen = () => {
    setDraft(actions);
    setAddMode(false);
  };

  React.useEffect(() => {
    if (isOpen) handleOpen();
  }, [isOpen]);

  const removeAction = (id: string) => {
    setDraft((prev) => prev.filter((a) => a.id !== id));
  };

  const addAction = (type: QuickActionType) => {
    if (draft.some((a) => a.type === type)) return;
    setDraft((prev) => [...prev, { id: genId(), type }]);
    setAddMode(false);
  };

  const resetDefaults = () => {
    setDraft(DEFAULT_QUICK_ACTIONS);
  };

  const handleSave = async () => {
    await saveActions(draft);
    onClose();
  };

  const availableToAdd = AVAILABLE_QUICK_ACTION_TYPES.filter(
    (t) => !draft.some((a) => a.type === t),
  );

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Edit Aksi Cepat">
      <div className="px-4 pb-6 space-y-4">
        <p className="text-xs text-text-muted">
          Pilih hingga 6 aksi yang tampil di beranda dan menu cepat.
        </p>

        <div className="space-y-2">
          {draft.map((action) => {
            const meta = QUICK_ACTION_META[action.type];
            return (
              <div
                key={action.id}
                className="flex items-center gap-3 bg-bg-card rounded-2xl px-3 py-3 shadow-card"
              >
                <GripVertical size={16} className="text-text-muted flex-shrink-0 opacity-50" />
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: meta.iconBg }}
                >
                  <DynamicIcon
                    name={meta.iconName}
                    size={17}
                    style={{ color: meta.iconColor }}
                  />
                </div>
                <span className="flex-1 text-sm font-semibold text-text-primary">
                  {meta.label}
                </span>
                <button
                  onClick={() => removeAction(action.id)}
                  aria-label={`Hapus ${meta.label}`}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-danger/70 hover:bg-danger/10 active:scale-90 transition-all"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            );
          })}
        </div>

        {draft.length < 6 && (
          <div>
            {addMode ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">
                    Pilih aksi
                  </p>
                  <button
                    onClick={() => setAddMode(false)}
                    className="text-text-muted p-1"
                    aria-label="Tutup pilih aksi"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {availableToAdd.map((type) => {
                    const meta = QUICK_ACTION_META[type];
                    return (
                      <button
                        key={type}
                        onClick={() => addAction(type)}
                        className="flex items-center gap-2.5 bg-bg-card rounded-2xl px-3 py-2.5 active:scale-95 transition-transform text-left"
                      >
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: meta.iconBg }}
                        >
                          <DynamicIcon
                            name={meta.iconName}
                            size={15}
                            style={{ color: meta.iconColor }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-text-primary truncate">
                          {meta.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <button
                onClick={() => setAddMode(true)}
                className={cn(
                  "w-full flex items-center justify-center gap-2 py-3 rounded-2xl",
                  "border-2 border-dashed border-bg-surface text-text-muted",
                  "active:bg-bg-surface transition-colors text-sm font-semibold",
                )}
              >
                <Plus size={16} />
                Tambah Aksi
              </button>
            )}
          </div>
        )}

        <div className="flex gap-2.5 pt-1">
          <button
            onClick={resetDefaults}
            className="flex-1 py-3 rounded-2xl bg-bg-surface text-text-muted text-sm font-semibold active:opacity-70 transition-opacity"
          >
            Reset Bawaan
          </button>
          <button
            onClick={() => { void handleSave(); }}
            className="flex-[2] py-3 rounded-2xl bg-accent-primary text-white text-sm font-semibold flex items-center justify-center gap-2 active:scale-[0.97] transition-transform"
          >
            <Check size={16} />
            Simpan
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}
