import { useNarra, useCopy } from './state';
import './language-switch.css';

export default function LanguageSwitch() {
  const { profile, setProfile } = useNarra(); const tr = useCopy();
  return <div className="language-switch" role="group" aria-label={tr('App language', 'Ngôn ngữ ứng dụng')}>
    <button type="button" lang="vi" title="Tiếng Việt" aria-label="Tiếng Việt" aria-pressed={profile.uiLanguage === 'Tiếng Việt'} onClick={() => setProfile(current => current.uiLanguage === 'Tiếng Việt' ? current : { ...current, uiLanguage: 'Tiếng Việt' })}>VI</button>
    <button type="button" lang="en" title="English" aria-label="English" aria-pressed={profile.uiLanguage === 'English'} onClick={() => setProfile(current => current.uiLanguage === 'English' ? current : { ...current, uiLanguage: 'English' })}>EN</button>
  </div>;
}
