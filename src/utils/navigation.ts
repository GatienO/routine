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

export function confirmAction({ title, message, onConfirm }: ConfirmOptions) {
  if (typeof window !== 'undefined' && typeof window.confirm === 'function') {
    if (window.confirm(`${title}\n\n${message}`)) {
      onConfirm();
    }
    return;
  }

  const { Alert } = require('react-native');
  Alert.alert(title, message, [
    { text: 'Annuler', style: 'cancel' },
    { text: 'Confirmer', style: 'destructive', onPress: onConfirm },
  ]);
}
