import React from 'react';
import { useTranslation } from 'react-i18next';
import './LanguageSelector.css';

const LanguageSelector = () => {
  const { i18n, t } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="language-selector">
      <label className="language-label">{t('language')}:</label>
      <select 
        value={i18n.language} 
        onChange={(e) => changeLanguage(e.target.value)}
        className="language-select"
      >
        <option value="en">{t('languages.en')}</option>
        <option value="fr">{t('languages.fr')}</option>
      </select>
    </div>
  );
};

export default LanguageSelector; 