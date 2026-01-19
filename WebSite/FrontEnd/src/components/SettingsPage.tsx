import { Card } from './ui/card';
import { useTranslation } from 'react-i18next';

export function SettingsPage() {
  const { t } = useTranslation();
  return (
    <div className="space-y-4 sm:space-y-6">
      <h1 className="text-2xl sm:text-3xl">{t('actions.settings')}</h1>
      <Card className="rounded-2xl border bg-white p-6 text-sm text-muted-foreground">
        Settings page is under construction.
      </Card>
    </div>
  );
}

