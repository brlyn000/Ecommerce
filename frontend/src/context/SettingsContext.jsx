import { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    siteName: 'Naragatra Ecommerce',
    adminEmail: 'admin@naragatra.com',
    companyAddress: 'Jl. Contoh No. 123, Jakarta',
    phone: '+62 812-3456-7890',
    whatsapp: '+62 812-3456-7890',
    socialMedia: {
      facebook: 'https://facebook.com/naragatra',
      instagram: 'https://instagram.com/naragatra',
      twitter: 'https://twitter.com/naragatra'
    }
  });

  useEffect(() => {
    const savedSettings = localStorage.getItem('siteSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const updateSettings = (newSettings) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    localStorage.setItem('siteSettings', JSON.stringify(updatedSettings));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};