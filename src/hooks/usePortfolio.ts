import { useState, useEffect } from 'react';
import portfolioData from '../data/portfolio.json';

const STORAGE_KEY = 'portfolio_draft';

export interface PortfolioData {
  projects: any[];
  skills: any[];
  certifications: any[];
  about: any;
  social: any;
}

const DEFAULT_DATA: PortfolioData = {
  projects: [],
  skills: [],
  certifications: [],
  about: {
    description: '',
    tags: [],
    education: { school: '', degree: '', cgpa: '', years: '' },
    coursework: []
  },
  social: {
    resumeUrl: '/resume.pdf',
    linkedin: '',
    github: '',
    leetcode: '',
    email: ''
  }
};

export const usePortfolio = () => {
  const [data, setData] = useState<PortfolioData>(() => {
    // Initial load: prefer JSON then defaults
    const base = portfolioData || {};
    return {
      projects: base.projects || [],
      skills: base.skills || [],
      certifications: base.certifications || [],
      about: base.about || DEFAULT_DATA.about,
      social: base.social || DEFAULT_DATA.social
    };
  });

  useEffect(() => {
    // Load local storage overrides on mount
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          const fallbackBase = portfolioData || {};
          setData({
            projects: parsed.projects || [],
            skills: parsed.skills || [],
            certifications: parsed.certifications || [],
            about: parsed.about || fallbackBase.about || DEFAULT_DATA.about,
            social: parsed.social || fallbackBase.social || DEFAULT_DATA.social
          });
        }
      } catch (e) {
        console.error('Failed to parse portfolio draft', e);
      }
    }

    // Sync across tabs if user has multiple open
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setData({
            projects: parsed.projects || [],
            skills: parsed.skills || [],
            certifications: parsed.certifications || [],
            about: parsed.about || data.about, // fallback to current if missing in sync
            social: parsed.social || data.social
          });
        } catch (e) {}
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return data;
};
