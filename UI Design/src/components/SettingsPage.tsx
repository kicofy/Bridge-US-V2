import { useState } from 'react';
import { ArrowLeft, User, Bell, Lock, Globe, Palette, Shield, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { use3DHover } from '../hooks/use3DHover';

interface SettingsPageProps {
  onBack: () => void;
  currentUser: { email: string; username: string } | null;
  onLogout?: () => void;
}

export function SettingsPage({ onBack, currentUser, onLogout }: SettingsPageProps) {
  const backBtn3D = use3DHover({ maxRotation: 6, scale: 1.05 });
  const saveBtn3D = use3DHover({ maxRotation: 6, scale: 1.05 });
  const logoutBtn3D = use3DHover({ maxRotation: 6, scale: 1.05 });
  const card1_3D = use3DHover({ maxRotation: 3, scale: 1.01 });
  const card2_3D = use3DHover({ maxRotation: 3, scale: 1.01 });
  const card3_3D = use3DHover({ maxRotation: 3, scale: 1.01 });
  const card4_3D = use3DHover({ maxRotation: 3, scale: 1.01 });
  const infoCard3D = use3DHover({ maxRotation: 3, scale: 1.01 });
  
  // Settings state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [postUpdates, setPostUpdates] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [allowMessages, setAllowMessages] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const settingSections = [
    {
      icon: User,
      title: 'Account',
      description: 'Manage your account information',
      items: [
        { label: 'Username', value: currentUser?.username || 'N/A', type: 'text' },
        { label: 'Email', value: currentUser?.email || 'N/A', type: 'text' },
      ],
      hook3D: card1_3D
    },
    {
      icon: Bell,
      title: 'Notifications',
      description: 'Customize your notification preferences',
      items: [
        { label: 'Email Notifications', value: emailNotifications, onChange: setEmailNotifications, type: 'switch' },
        { label: 'Push Notifications', value: pushNotifications, onChange: setPushNotifications, type: 'switch' },
        { label: 'Post Updates', value: postUpdates, onChange: setPostUpdates, type: 'switch' },
        { label: 'Weekly Digest', value: weeklyDigest, onChange: setWeeklyDigest, type: 'switch' },
      ],
      hook3D: card2_3D
    },
    {
      icon: Shield,
      title: 'Privacy',
      description: 'Control your privacy settings',
      items: [
        { label: 'Show Email Publicly', value: showEmail, onChange: setShowEmail, type: 'switch' },
        { label: 'Allow Direct Messages', value: allowMessages, onChange: setAllowMessages, type: 'switch' },
      ],
      hook3D: card3_3D
    },
    {
      icon: Palette,
      title: 'Appearance',
      description: 'Customize how BridgeUS looks',
      items: [
        { label: 'Dark Mode', value: darkMode, onChange: setDarkMode, type: 'switch' },
      ],
      hook3D: card4_3D
    }
  ];

  const handleSave = () => {
    // In a real app, this would save settings to the backend
    console.log('Settings saved');
    alert('Settings saved successfully!');
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          ref={backBtn3D.ref}
          style={backBtn3D.style}
          onMouseMove={backBtn3D.onMouseMove}
          onMouseEnter={backBtn3D.onMouseEnter}
          onMouseLeave={backBtn3D.onMouseLeave}
          onClick={onBack}
          className="p-2 rounded-xl glass hover:bg-white/60 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl text-[var(--bridge-blue)]">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your account preferences and settings
          </p>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="space-y-4">
        {settingSections.map((section, idx) => {
          const Icon = section.icon;
          return (
            <div 
              key={idx} 
              ref={section.hook3D.ref}
              style={section.hook3D.style}
              onMouseMove={section.hook3D.onMouseMove}
              onMouseEnter={section.hook3D.onMouseEnter}
              onMouseLeave={section.hook3D.onMouseLeave}
              className="glass rounded-xl p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-[var(--bridge-blue-light)]">
                  <Icon className="h-5 w-5 text-[var(--bridge-blue)]" />
                </div>
                <div>
                  <h2 className="text-lg text-foreground">{section.title}</h2>
                  <p className="text-sm text-muted-foreground">{section.description}</p>
                </div>
              </div>

              <div className="space-y-4 ml-14">
                {section.items.map((item, itemIdx) => (
                  <div key={itemIdx} className="flex items-center justify-between py-2">
                    <span className="text-sm text-foreground">{item.label}</span>
                    {item.type === 'text' && (
                      <span className="text-sm text-muted-foreground">{item.value as string}</span>
                    )}
                    {item.type === 'switch' && (
                      <Switch
                        checked={item.value as boolean}
                        onCheckedChange={item.onChange as (checked: boolean) => void}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Save Button */}
      <div className="mt-6 flex justify-end">
        <button
          ref={saveBtn3D.ref}
          style={saveBtn3D.style}
          onMouseMove={saveBtn3D.onMouseMove}
          onMouseEnter={saveBtn3D.onMouseEnter}
          onMouseLeave={saveBtn3D.onMouseLeave}
          onClick={handleSave}
          className="px-6 py-3 rounded-xl bg-[var(--bridge-blue)] text-white hover:opacity-90 transition-opacity"
        >
          Save Changes
        </button>
      </div>

      {/* Additional Info */}
      <div 
        ref={infoCard3D.ref}
        style={infoCard3D.style}
        onMouseMove={infoCard3D.onMouseMove}
        onMouseEnter={infoCard3D.onMouseEnter}
        onMouseLeave={infoCard3D.onMouseLeave}
        className="mt-8 p-4 glass-subtle rounded-xl"
      >
        <div className="flex items-start gap-3">
          <Lock className="h-5 w-5 text-[var(--bridge-blue)] mt-0.5" />
          <div>
            <h3 className="text-sm text-foreground">Data Privacy</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Your settings are stored securely and only used to improve your BridgeUS experience. 
              We never share your personal information with third parties.
            </p>
          </div>
        </div>
      </div>

      {/* Logout Button */}
      {onLogout && (
        <div className="mt-6 pt-6 border-t border-border flex justify-center">
          <button
            ref={logoutBtn3D.ref}
            style={logoutBtn3D.style}
            onMouseMove={logoutBtn3D.onMouseMove}
            onMouseEnter={logoutBtn3D.onMouseEnter}
            onMouseLeave={logoutBtn3D.onMouseLeave}
            onClick={onLogout}
            className="flex items-center gap-2 px-8 py-3 rounded-xl border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-all"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  );
}