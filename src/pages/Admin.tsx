import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Plus, Trash2, Download, Briefcase, Brain, Award, ArrowLeft, Eye, ArrowUp, ArrowDown, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import portfolioData from '../data/portfolio.json';

const Admin = () => {
  // Use a fallback to ensure we always have the expected structure
  const [data, setData] = useState<any>(() => {
    const saved = localStorage.getItem('portfolio_draft');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return {
            projects: parsed.projects || [],
            skills: parsed.skills || [],
            certifications: parsed.certifications || [],
            about: parsed.about || portfolioData.about || {},
            social: parsed.social || portfolioData.social || {}
          };
        }
      } catch (e) {}
    }
    
    // Fallback to JSON or empty
    const base: any = portfolioData || {};
    return {
      projects: base.projects || [],
      skills: base.skills || [],
      certifications: base.certifications || [],
      about: base.about || {},
      social: base.social || {}
    };
  });
  
  const [activeTab, setActiveTab] = useState<'projects' | 'skills' | 'certifications' | 'about'>('projects');
  const [isDirty, setIsDirty] = useState(false);

  // Sync across tabs if user has multiple open (same as hook)
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'portfolio_draft' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setData({
            projects: parsed.projects || [],
            skills: parsed.skills || [],
            certifications: parsed.certifications || [],
            about: parsed.about || data.about || {},
            social: parsed.social || data.social || {}
          });
        } catch (e) {}
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const saveToLocal = () => {
    localStorage.setItem('portfolio_draft', JSON.stringify(data));
    setIsDirty(false);
    toast.success('Changes saved to browser storage!');
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'portfolio.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.info('JSON Exported! Replace src/data/portfolio.json with this file.');
  };

  const addItem = () => {
    const newData = { ...data };
    if (activeTab === 'projects') {
      newData.projects = [
        ...newData.projects,
        {
          title: 'New Project',
          subtitle: 'Category',
          description: 'Description here...',
          tech: ['React'],
          stats: [{ label: 'Stat', value: '100' }],
          color: '#05d9e8'
        }
      ];
    } else if (activeTab === 'skills') {
      newData.skills = [
        ...newData.skills,
        {
          id: `new-${Date.now()}`,
          title: 'New Skill Category',
          label: 'NEW',
          color: '#ff2a6d',
          icon: 'Code2',
          skills: ['Skill 1', 'Skill 2']
        }
      ];
    } else {
      newData.certifications = [
        ...newData.certifications,
        {
          title: 'New Achievement',
          subtitle: 'Organization',
          date: '2024',
          description: 'Details...',
          color: '#b743e8',
          icon: 'Award'
        }
      ];
    }
    setData(newData);
    setIsDirty(true);
  };

  const removeItem = (index: number) => {
    const newData = { ...data };
    if (activeTab === 'projects') newData.projects = newData.projects.filter((_: any, i: number) => i !== index);
    else if (activeTab === 'skills') newData.skills = newData.skills.filter((_: any, i: number) => i !== index);
    else newData.certifications = newData.certifications.filter((_: any, i: number) => i !== index);
    setData(newData);
    setIsDirty(true);
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newData = { ...data };
    let list = [];
    if (activeTab === 'projects') list = [...newData.projects];
    else if (activeTab === 'skills') list = [...newData.skills];
    else list = [...newData.certifications];
    
    list[index] = { ...list[index], [field]: value };
    
    if (activeTab === 'projects') newData.projects = list;
    else if (activeTab === 'skills') newData.skills = list;
    else newData.certifications = list;
    
    setData(newData);
    setIsDirty(true);
  };

  const moveItem = (index: number, direction: number) => {
    const newData = { ...data };
    let list = [];
    if (activeTab === 'projects') list = [...newData.projects];
    else if (activeTab === 'skills') list = [...newData.skills];
    else if (activeTab === 'certifications') list = [...newData.certifications];
    else return;

    if (index + direction < 0 || index + direction >= list.length) return;
    
    const temp = list[index];
    list[index] = list[index + direction];
    list[index + direction] = temp;

    if (activeTab === 'projects') newData.projects = list;
    else if (activeTab === 'skills') newData.skills = list;
    else newData.certifications = list;

    setData(newData);
    setIsDirty(true);
  };

  const updateAbout = (field: string, value: any, nestedField?: string) => {
    const newData = { ...data, about: { ...data.about } };
    if (nestedField) {
       newData.about[field] = { ...(newData.about[field] || {}), [nestedField]: value };
    } else {
       newData.about[field] = value;
    }
    setData(newData);
    setIsDirty(true);
  };

  const updateSocial = (field: string, value: string) => {
    const newData = { ...data, social: { ...data.social, [field]: value } };
    setData(newData);
    setIsDirty(true);
  };

  return (
    <div className="min-h-screen bg-[#0a0514] text-white font-sans selection:bg-[#05d9e8]/30">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#05d9e8] blur-[150px] -translate-y-1/2 translate-x-1/2 rounded-full" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#ff2a6d] blur-[150px] translate-y-1/2 -translate-x-1/2 rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <Link to="/" className="flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-4 group">
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span className="font-mono text-xs tracking-widest uppercase">Back to City</span>
            </Link>
            <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
              City <span className="text-[#05d9e8]">Control Center</span>
            </h1>
            <p className="text-white/40 font-mono text-sm mt-2">Dataroom Administration & Portfolio Sync</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={saveToLocal}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-mono text-xs tracking-widest uppercase transition-all ${isDirty ? 'bg-[#05d9e8] text-black shadow-[0_0_20px_rgba(5,217,232,0.4)]' : 'bg-white/5 text-white/50 border border-white/10'}`}
            >
              <Save size={16} />
              Save Draft
            </button>
            <button
              onClick={exportJSON}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all font-mono text-xs tracking-widest uppercase"
            >
              <Download size={16} />
              Export JSON
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-white/10 pb-4 overflow-x-auto">
          {[
            { id: 'about', label: 'About', icon: User, color: '#ffb800' },
            { id: 'projects', label: 'Projects', icon: Briefcase, color: '#05d9e8' },
            { id: 'skills', label: 'Skills', icon: Brain, color: '#ff2a6d' },
            { id: 'certifications', label: 'Certifications', icon: Award, color: '#b743e8' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-mono text-xs tracking-widest uppercase transition-all ${activeTab === tab.id ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'}`}
              style={activeTab === tab.id ? { color: tab.color, border: `1px solid ${tab.color}40` } : {}}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Editor List */}
          <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-white/10">
            {activeTab === 'about' ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-2xl border border-white/10 bg-white/[0.03] space-y-6"
              >
                <div>
                  <label className="block text-[10px] font-mono text-white/30 tracking-widest uppercase mb-1">Mission Objective / Bio</label>
                  <textarea
                    value={data.about?.description || ''}
                    onChange={(e) => updateAbout('description', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:border-[#05d9e8]/50 focus:outline-none min-h-[120px]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-white/30 tracking-widest uppercase mb-1">Tags (Comma separated)</label>
                  <input
                    value={(data.about?.tags || []).join(', ')}
                    onChange={(e) => updateAbout('tags', e.target.value.split(',').map((s: string) => s.trim()))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:border-[#05d9e8]/50 focus:outline-none"
                  />
                </div>
                <div className="pt-4 border-t border-white/5">
                  <h4 className="font-display text-xl text-white mb-4">Education</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-mono text-white/30 tracking-widest uppercase mb-1">School</label>
                      <input
                        value={data.about?.education?.school || ''}
                        onChange={(e) => updateAbout('education', e.target.value, 'school')}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:border-[#05d9e8]/50 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-white/30 tracking-widest uppercase mb-1">Degree / Major</label>
                      <input
                        value={data.about?.education?.degree || ''}
                        onChange={(e) => updateAbout('education', e.target.value, 'degree')}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:border-[#05d9e8]/50 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-white/30 tracking-widest uppercase mb-1">CGPA</label>
                      <input
                        value={data.about?.education?.cgpa || ''}
                        onChange={(e) => updateAbout('education', e.target.value, 'cgpa')}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:border-[#05d9e8]/50 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-white/30 tracking-widest uppercase mb-1">Years (e.g. 2023 - 2027)</label>
                      <input
                        value={data.about?.education?.years || ''}
                        onChange={(e) => updateAbout('education', e.target.value, 'years')}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:border-[#05d9e8]/50 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
                <div className="pt-4 border-t border-white/5">
                  <label className="block text-[10px] font-mono text-white/30 tracking-widest uppercase mb-1">Coursework (Comma separated)</label>
                  <input
                    value={(data.about?.coursework || []).join(', ')}
                    onChange={(e) => updateAbout('coursework', e.target.value.split(',').map((s: string) => s.trim()))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:border-[#05d9e8]/50 focus:outline-none"
                  />
                </div>
                <div className="pt-4 border-t border-white/5">
                  <h4 className="font-display text-xl text-white mb-4">Social Hub / Links</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-mono text-white/30 tracking-widest uppercase mb-1">LinkedIn URL</label>
                      <input
                        value={data.social?.linkedin || ''}
                        onChange={(e) => updateSocial('linkedin', e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:border-[#05d9e8]/50 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-white/30 tracking-widest uppercase mb-1">GitHub URL</label>
                      <input
                        value={data.social?.github || ''}
                        onChange={(e) => updateSocial('github', e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:border-[#05d9e8]/50 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-white/30 tracking-widest uppercase mb-1">LeetCode URL</label>
                      <input
                        value={data.social?.leetcode || ''}
                        onChange={(e) => updateSocial('leetcode', e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:border-[#05d9e8]/50 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-white/30 tracking-widest uppercase mb-1">Email Address</label>
                      <input
                        value={data.social?.email || ''}
                        onChange={(e) => updateSocial('email', e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:border-[#05d9e8]/50 focus:outline-none"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[10px] font-mono text-white/30 tracking-widest uppercase mb-1">Resume Document (URL or Upload PDF)</label>
                      <div className="flex gap-3 items-center">
                        <input
                          value={data.social?.resumeUrl || ''}
                          onChange={(e) => updateSocial('resumeUrl', e.target.value)}
                          placeholder="e.g., /resume.pdf"
                          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:border-[#05d9e8]/50 focus:outline-none"
                        />
                        <div className="relative overflow-hidden cursor-pointer bg-white/10 hover:bg-white/20 transition-colors border border-white/20 rounded-lg px-4 py-2 text-sm text-white/70 font-mono text-xs whitespace-nowrap">
                          <span>Upload PDF</span>
                          <input
                            type="file"
                            accept=".pdf"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            title="Drag and drop or click to upload PDF"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                if (file.size > 2 * 1024 * 1024) {
                                  toast.error("File is too large! Maximum size is 2MB.");
                                  return;
                                }
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  updateSocial('resumeUrl', event.target?.result as string);
                                  toast.success("Resume embedded successfully!");
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <>
                <AnimatePresence mode="popLayout">
                  {((activeTab === 'projects' ? data.projects : activeTab === 'skills' ? data.skills : data.certifications) || []).map((item: any, idx: number) => (
                    <motion.div
                      key={`${activeTab}-${idx}`}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="p-6 rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.05] transition-all group"
                    >
                      <div className="flex justify-between items-start mb-6">
                        <input
                          value={item.title || ''}
                          onChange={(e) => updateItem(idx, 'title', e.target.value)}
                          className="bg-transparent border-none text-xl font-display text-white w-full focus:outline-none"
                          placeholder="Enter Title..."
                        />
                        <div className="flex items-center gap-1 shrink-0 ml-4">
                          <button
                            onClick={() => moveItem(idx, -1)}
                            className="p-2 text-white/20 hover:text-white transition-colors disabled:opacity-30 disabled:pointer-events-none"
                            title="Move Up"
                            disabled={idx === 0}
                          >
                            <ArrowUp size={18} />
                          </button>
                          <button
                            onClick={() => moveItem(idx, 1)}
                            className="p-2 text-white/20 hover:text-white transition-colors disabled:opacity-30 disabled:pointer-events-none"
                            title="Move Down"
                            disabled={idx === ((activeTab === 'projects' ? data.projects : activeTab === 'skills' ? data.skills : data.certifications) || []).length - 1}
                          >
                            <ArrowDown size={18} />
                          </button>
                          <div className="w-px h-6 bg-white/10 mx-1" />
                          <button
                            onClick={() => removeItem(idx)}
                            className="p-2 text-white/20 hover:text-red-400 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>

                      <div className="grid gap-4">
                        {activeTab !== 'skills' ? (
                          <div>
                            <label className="block text-[10px] font-mono text-white/30 tracking-widest uppercase mb-1">Subtitle / Category</label>
                            <input
                              value={item.subtitle || ''}
                              onChange={(e) => updateItem(idx, 'subtitle', e.target.value)}
                              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:border-[#05d9e8]/50 focus:outline-none"
                            />
                          </div>
                        ) : (
                          <div>
                            <label className="block text-[10px] font-mono text-white/30 tracking-widest uppercase mb-1">Label (e.g. LANG, AI)</label>
                            <input
                              value={item.label || ''}
                              onChange={(e) => updateItem(idx, 'label', e.target.value)}
                              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:border-[#05d9e8]/50 focus:outline-none"
                            />
                          </div>
                        )}

                        {activeTab !== 'skills' ? (
                          <div>
                            <label className="block text-[10px] font-mono text-white/30 tracking-widest uppercase mb-1">Description</label>
                            <textarea
                              value={item.description || ''}
                              onChange={(e) => updateItem(idx, 'description', e.target.value)}
                              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:border-[#05d9e8]/50 focus:outline-none min-h-[80px]"
                            />
                          </div>
                        ) : (
                          <div>
                            <label className="block text-[10px] font-mono text-white/30 tracking-widest uppercase mb-1">Skills (Comma separated)</label>
                            <input
                              value={(item.skills || []).join(', ')}
                              onChange={(e) => updateItem(idx, 'skills', e.target.value.split(',').map((s: string) => s.trim()))}
                              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:border-[#05d9e8]/50 focus:outline-none"
                            />
                          </div>
                        )}

                        {activeTab === 'projects' && (
                          <div className="grid grid-cols-1 gap-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-[10px] font-mono text-white/30 tracking-widest uppercase mb-1">GitHub URL</label>
                                <input
                                  value={item.githubUrl || ''}
                                  onChange={(e) => updateItem(idx, 'githubUrl', e.target.value)}
                                  placeholder="https://github.com/..."
                                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:border-[#05d9e8]/50 focus:outline-none"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-mono text-white/30 tracking-widest uppercase mb-1">Live URL</label>
                                <input
                                  value={item.liveUrl || ''}
                                  onChange={(e) => updateItem(idx, 'liveUrl', e.target.value)}
                                  placeholder="https://..."
                                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:border-[#05d9e8]/50 focus:outline-none"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-[10px] font-mono text-white/30 tracking-widest uppercase mb-1">Tech Stack (Comma separated)</label>
                              <input
                                value={(item.tech || []).join(', ')}
                                onChange={(e) => updateItem(idx, 'tech', e.target.value.split(',').map((s: string) => s.trim()))}
                                placeholder="React, Node.js, Python..."
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:border-[#05d9e8]/50 focus:outline-none"
                              />
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-mono text-white/30 tracking-widest uppercase mb-1">Accent Color</label>
                            <div className="flex gap-2">
                              <input
                                type="color"
                                value={item.color || '#05d9e8'}
                                onChange={(e) => updateItem(idx, 'color', e.target.value)}
                                className="bg-transparent border-none w-8 h-8 rounded shrink-0"
                              />
                              <input
                                value={item.color || '#05d9e8'}
                                onChange={(e) => updateItem(idx, 'color', e.target.value)}
                                className="flex-1 min-w-0 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-xs font-mono"
                              />
                            </div>
                          </div>
                          {activeTab === 'certifications' && (
                            <div>
                              <label className="block text-[10px] font-mono text-white/30 tracking-widest uppercase mb-1">Date</label>
                              <input
                                value={item.date || ''}
                                onChange={(e) => updateItem(idx, 'date', e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:border-[#05d9e8]/50 focus:outline-none"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                <button
                  onClick={addItem}
                  className="w-full p-6 rounded-2xl border-2 border-dashed border-white/10 hover:border-[#05d9e8]/30 hover:bg-[#05d9e8]/5 transition-all flex items-center justify-center gap-2 group"
                >
                  <Plus size={20} className="text-white/20 group-hover:text-[#05d9e8] transition-colors" />
                  <span className="font-mono text-xs tracking-widest uppercase text-white/30 group-hover:text-white transition-colors">Add New {activeTab.slice(0, -1)}</span>
                </button>
              </>
            )}
          </div>

          {/* Live Preview / Help */}
          <div className="sticky top-12 space-y-6">
            <div className="p-8 rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-transparent backdrop-blur-3xl overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4">
                <Eye size={20} className="text-[#05d9e8] opacity-50" />
              </div>
              <h3 className="font-display text-2xl mb-4 font-bold tracking-tight">System Status</h3>
              <div className="space-y-4 font-mono text-xs tracking-wide">
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-white/40">JSON Status</span>
                  <span className="text-[#05d9e8]">ONLINE</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-white/40">Total Projects</span>
                  <span>{data?.projects?.length || 0}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-white/40">Skill Verticals</span>
                  <span>{data?.skills?.length || 0}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-white/40">Awards & Certs</span>
                  <span>{data?.certifications?.length || 0}</span>
                </div>
              </div>

              <div className="mt-8 p-6 rounded-2xl bg-black/40 border border-white/5">
                <h4 className="text-[10px] font-mono tracking-[0.3em] uppercase text-[#05d9e8] mb-3">AI Integration Guide</h4>
                <p className="text-sm text-white/60 leading-relaxed italic">
                  "Changes made here are stored in your browser session. To make them permanent in the world of Silicon City, click 'Export JSON' and I'll help you update the core codebase."
                </p>
                <div className="mt-4 pt-4 border-t border-white/5 flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[10px] text-white/30 tracking-widest uppercase">AI Agent Standing By</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-yellow-500/20 bg-yellow-500/5">
               <p className="text-xs text-yellow-500/80 leading-relaxed font-mono">
                 ⚠️ NOTICE: Remember to update the matching Info Towers in the 3D scene if you add new districts.
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
