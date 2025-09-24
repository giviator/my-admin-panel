import React, { useState } from 'react';
import Catalogs from './Catalogs';

type TabType = 'catalogs' | 'settings' | 'seo';

const WebsiteManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('catalogs');

  const tabs = [
    { id: 'catalogs' as TabType, name: 'Каталоги', component: <Catalogs /> },
    { 
      id: 'settings' as TabType, 
      name: 'Налаштування', 
      component: (
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Налаштування сайту
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Тут будуть налаштування сайту
          </p>
        </div>
      )
    },
    { 
      id: 'seo' as TabType, 
      name: 'SEO', 
      component: (
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            SEO налаштування
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Тут будуть SEO налаштування
          </p>
        </div>
      )
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Робота з сайтом
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Управління контентом та налаштуваннями сайту
          </p>
        </div>
        
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="px-6 flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="flex-1">
        {tabs.find(tab => tab.id === activeTab)?.component}
      </div>
    </div>
  );
};

export default WebsiteManagement;