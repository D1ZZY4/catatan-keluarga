type PickerCallback<T> = (value: T) => void;

let categoryCallback: PickerCallback<{ id: string; name: string; icon: string; color: string }> | null = null;
let walletCallback: PickerCallback<{ id: string; name: string; icon: string; color: string; currency: string }> | null = null;

export const PickerBridge = {
  onCategorySelected(
    cb: PickerCallback<{ id: string; name: string; icon: string; color: string }>,
  ): void {
    categoryCallback = cb;
  },

  resolveCategory(value: { id: string; name: string; icon: string; color: string }): void {
    categoryCallback?.(value);
    categoryCallback = null;
  },

  onWalletSelected(
    cb: PickerCallback<{ id: string; name: string; icon: string; color: string; currency: string }>,
  ): void {
    walletCallback = cb;
  },

  resolveWallet(value: { id: string; name: string; icon: string; color: string; currency: string }): void {
    walletCallback?.(value);
    walletCallback = null;
  },
};
