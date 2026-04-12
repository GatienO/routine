import { showAppConfirm } from '../components/feedback/AppFeedbackProvider';

type RouterLike = {
  back: () => void;
  replace: (href: any) => void;
  canGoBack?: () => boolean;
};

interface ConfirmOptions {
  title: string;
  message: string;
  onConfirm: () => void;
}

export function backOrReplace(router: RouterLike, fallbackHref: any) {
  if (typeof router.canGoBack === 'function' && router.canGoBack()) {
    router.back();
    return;
  }

  router.replace(fallbackHref);
}

export async function confirmAction({ title, message, onConfirm }: ConfirmOptions) {
  const confirmed = await showAppConfirm({
    title,
    message,
    tone: 'warning',
    confirmLabel: 'Confirmer',
    cancelLabel: 'Annuler',
    confirmKind: 'danger',
  });

  if (confirmed) {
    onConfirm();
  }
}
