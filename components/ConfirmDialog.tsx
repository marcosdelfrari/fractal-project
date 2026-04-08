"use client";

import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";

export type ConfirmDialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  variant?: "danger" | "default";
  isBusy?: boolean;
};

export default function ConfirmDialog({
  open,
  onClose,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  onConfirm,
  variant = "default",
  isBusy = false,
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    void onConfirm();
  };

  const confirmClass =
    variant === "danger"
      ? "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 disabled:opacity-60"
      : "bg-zinc-900 text-white hover:bg-zinc-800 focus-visible:ring-zinc-500 disabled:opacity-60";

  return (
    <Transition show={open} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-[100]"
        open={open}
        onClose={() => {
          if (!isBusy) onClose();
        }}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-[1px]" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl border-2 border-black bg-white p-6 text-left shadow-xl transition-all">
                <Dialog.Title className="text-lg font-medium text-zinc-900 tracking-tight">
                  {title}
                </Dialog.Title>
                {description ? (
                  <Dialog.Description className="mt-2 text-sm text-zinc-600 font-light leading-relaxed">
                    {description}
                  </Dialog.Description>
                ) : null}
                <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={onClose}
                    className="inline-flex justify-center rounded-full border border-zinc-300 bg-white px-5 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
                  >
                    {cancelLabel}
                  </button>
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={handleConfirm}
                    className={`inline-flex justify-center rounded-full px-5 py-2.5 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${confirmClass}`}
                  >
                    {isBusy ? "Aguarde…" : confirmLabel}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
