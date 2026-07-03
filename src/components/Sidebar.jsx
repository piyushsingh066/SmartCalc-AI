import React from 'react';
import { 
  Calculator, 
  Binary, 
  LineChart, 
  Coins, 
  Ruler, 
  History, 
  Star, 
  Settings, 
  Database,
  Terminal
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const Sidebar = ({ activeMode, setActiveMode }) => {
  const { playClickSound } = useTheme();

  const menuItems = [
    { id: 'Standard', name: 'Standard Calculator', icon: Calculator },
    { id: 'Scientific', name: 'Scientific Calc', icon: Terminal },
    { id: 'Programmer', name: 'Programmer Calc', icon: Binary },
    { id: 'GraphPlotter', name: 'Graph Plotter', icon: LineChart },
    { id: 'Currency', name: 'Currency Converter', icon: Coins },
    { id: 'Unit', name: 'Unit Converter', icon: Ruler },
    { id: 'History', name: 'Calculation History', icon: History },
    { id: 'Favorites', name: 'Favorites Log', icon: Star },
    { id: 'Settings', name: 'Settings & API Keys', icon: Settings },
    { id: 'DatabaseViewer', name: 'IndexedDB Manager', icon: Database }
  ];

  const handleSelect = (id) => {
    playClickSound();
    setActiveMode(id);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <Calculator className="w-8 h-8 text-blue-500" />
        <span>SmartCalc AI</span>
      </div>
      
      <ul className="sidebar-menu">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeMode === item.id;
          return (
            <li key={item.id}>
              <button
                className={`sidebar-item w-full text-left ${isActive ? 'active' : ''}`}
                onClick={() => handleSelect(item.id)}
              >
                <Icon size={18} />
                <span>{item.name}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
};
