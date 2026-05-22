import React from 'react';
import { AppTopNavigation } from './AppTopNavigation';

type AppPageHeaderProps = {
  title: string;
  onBack?: () => void;
};

export function AppPageHeader({ title, onBack }: AppPageHeaderProps) {
  return <AppTopNavigation title={title} onBack={onBack} />;
}
