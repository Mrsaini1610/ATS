// components/SettingsProvider.jsx
import React, { createContext, useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { route } from 'ziggy-js';

export const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axios.get(route('super.settings.list'));
        setSettings(response.data.settings);
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
};

// Add the hook to the same file
export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context == undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
