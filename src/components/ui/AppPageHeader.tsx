import React from 'react';
import { AppTopNavigation } from './AppTopNavigation';

type AppPageHeaderProps = {
  title: string;
  onBack?: () => void;
  onHome?: () => void;
};

export function AppPageHeader({ title, onBack, onHome }: AppPageHeaderProps) {
  return <AppTopNavigation title={title} onBack={onBack} onHome={onHome} />;
}
