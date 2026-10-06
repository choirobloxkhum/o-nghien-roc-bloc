/**
 * Robust, foolproof Clipboard helper for iFrame and mobile environments.
 * Handles "Document is not focused" by gracefully falling back to DOM execCommand.
 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  // Try focusing window first to satisfy focus requirements if possible
  try {
    window.focus();
  } catch {
    // ignore
  }

  // 1. Try modern Async Clipboard API
  if (navigator?.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      // Common in iframes: "DOMException: Document is not focused"
      // Gracefully fall back to execCommand below
      console.warn('Clipboard API rejected, trying DOM execCommand fallback...', err);
    }
  }

  // 2. DOM Textarea execCommand Fallback (works reliably in all browsers/iframes)
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    textArea.style.padding = '0';
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';
    textArea.style.opacity = '0';
    textArea.setAttribute('readonly', '');

    document.body.appendChild(textArea);
    textArea.focus({ preventScroll: true });
    textArea.select();
    textArea.setSelectionRange(0, text.length);

    const success = document.execCommand('copy');
    document.body.removeChild(textArea);
    return success;
  } catch (fallbackErr) {
    console.error('All clipboard copy strategies failed:', fallbackErr);
    return false;
  }
}
