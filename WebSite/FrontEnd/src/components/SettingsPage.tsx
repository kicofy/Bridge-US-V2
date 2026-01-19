import { useEffect, useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/auth';
import { getMyProfile, updateMyProfile } from '../api/profile';
import { resetPassword } from '../api/auth';
import { setLanguage } from '../i18n';

export function SettingsPage() {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const [profileForm, setProfileForm] = useState({
    display_name: '',
    location: '',
    bio: '',
    language_preference: 'en' as 'en' | 'zh',
  });
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);

  useEffect(() => {
    setLoadingProfile(true);
    getMyProfile()
      .then((data) => {
        setProfileForm({
          display_name: data.display_name ?? '',
          location: data.location ?? '',
          bio: data.bio ?? '',
          language_preference: data.language_preference === 'zh' ? 'zh' : 'en',
        });
      })
      .catch((err) => setProfileMessage(err instanceof Error ? err.message : t('settings.loadFailed')))
      .finally(() => setLoadingProfile(false));
  }, [t]);

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    setProfileMessage(null);
    try {
      const updated = await updateMyProfile({
        display_name: profileForm.display_name.trim(),
        location: profileForm.location.trim() || null,
        bio: profileForm.bio.trim() || null,
        language_preference: profileForm.language_preference,
      });
      setProfileForm({
        display_name: updated.display_name ?? '',
        location: updated.location ?? '',
        bio: updated.bio ?? '',
        language_preference: updated.language_preference === 'zh' ? 'zh' : 'en',
      });
      setLanguage(profileForm.language_preference);
      if (user) {
        setUser({
          email: user.email,
          displayName: updated.display_name ?? user.displayName,
          languagePreference: profileForm.language_preference,
        });
      }
      setProfileMessage(t('settings.profileSaved'));
    } catch (err) {
      setProfileMessage(err instanceof Error ? err.message : t('settings.saveFailed'));
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordMessage(null);
    if (!passwordForm.current_password || !passwordForm.new_password) {
      setPasswordMessage(t('settings.passwordRequired'));
      return;
    }
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordMessage(t('settings.passwordMismatch'));
      return;
    }
    setChangingPassword(true);
    try {
      await resetPassword({
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      });
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
      setPasswordMessage(t('settings.passwordUpdated'));
    } catch (err) {
      setPasswordMessage(err instanceof Error ? err.message : t('settings.saveFailed'));
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <h1 className="text-2xl sm:text-3xl">{t('actions.settings')}</h1>

      {/* Account */}
      <Card className="rounded-2xl border bg-white p-6 space-y-4">
        <div>
          <h2 className="text-lg font-semibold">{t('settings.account')}</h2>
          <p className="text-sm text-muted-foreground">{t('settings.accountHint')}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">{t('settings.email')}</label>
            <Input value={user?.email ?? ''} readOnly className="rounded-xl bg-muted/30" />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">{t('settings.displayName')}</label>
            <Input
              value={profileForm.display_name}
              onChange={(e) => setProfileForm((prev) => ({ ...prev, display_name: e.target.value }))}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">{t('settings.location')}</label>
            <Input
              value={profileForm.location}
              onChange={(e) => setProfileForm((prev) => ({ ...prev, location: e.target.value }))}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">{t('settings.language')}</label>
            <select
              value={profileForm.language_preference}
              onChange={(e) =>
                setProfileForm((prev) => ({
                  ...prev,
                  language_preference: e.target.value === 'zh' ? 'zh' : 'en',
                }))
              }
              className="h-10 w-full rounded-xl border bg-white px-3 text-sm"
            >
              <option value="en">{t('settings.languageEnglish')}</option>
              <option value="zh">{t('settings.languageChinese')}</option>
            </select>
            <p className="text-xs text-muted-foreground">{t('settings.languageHint')}</p>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <label className="text-sm text-muted-foreground">{t('settings.bio')}</label>
            <Textarea
              value={profileForm.bio}
              onChange={(e) => setProfileForm((prev) => ({ ...prev, bio: e.target.value }))}
              className="rounded-xl min-h-[120px]"
            />
          </div>
        </div>
        {profileMessage && (
          <div className="text-sm text-muted-foreground">{profileMessage}</div>
        )}
        <div className="flex justify-end">
          <Button
            onClick={handleSaveProfile}
            disabled={loadingProfile || savingProfile}
            className="rounded-xl"
          >
            {savingProfile ? t('settings.saving') : t('settings.save')}
          </Button>
        </div>
      </Card>

      {/* Security */}
      <Card className="rounded-2xl border bg-white p-6 space-y-4">
        <div>
          <h2 className="text-lg font-semibold">{t('settings.security')}</h2>
          <p className="text-sm text-muted-foreground">{t('settings.securityHint')}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">{t('settings.currentPassword')}</label>
            <Input
              type="password"
              value={passwordForm.current_password}
              onChange={(e) => setPasswordForm((prev) => ({ ...prev, current_password: e.target.value }))}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">{t('settings.newPassword')}</label>
            <Input
              type="password"
              value={passwordForm.new_password}
              onChange={(e) => setPasswordForm((prev) => ({ ...prev, new_password: e.target.value }))}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <label className="text-sm text-muted-foreground">{t('settings.confirmPassword')}</label>
            <Input
              type="password"
              value={passwordForm.confirm_password}
              onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirm_password: e.target.value }))}
              className="rounded-xl"
            />
          </div>
        </div>
        {passwordMessage && (
          <div className="text-sm text-muted-foreground">{passwordMessage}</div>
        )}
        <div className="flex justify-end">
          <Button
            onClick={handleChangePassword}
            disabled={changingPassword}
            className="rounded-xl"
          >
            {changingPassword ? t('settings.saving') : t('settings.updatePassword')}
          </Button>
        </div>
      </Card>
    </div>
  );
}

