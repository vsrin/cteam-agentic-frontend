import React, { useState } from 'react';

const Sidebar = ({ activeNav, onNavClick }) => {
  // State to track which menu groups are expanded
  const [expandedGroups, setExpandedGroups] = useState({
    'Catalog': true,
    'Builder': true
  });

  // Toggle submenu visibility
  const toggleGroup = (group) => {
    setExpandedGroups({
      ...expandedGroups,
      [group]: !expandedGroups[group]
    });
  };

  // Main menu structure with groups and submenus
  const menuStructure = [
    {
      name: 'Home',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6.66667 15.8333V10.8333H13.3333V15.8333M3.33333 8.33333L10 3.33333L16.6667 8.33333V16.6667H3.33333V8.33333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    {
      name: 'Catalog',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 13.3333C11.841 13.3333 13.3333 11.841 13.3333 10C13.3333 8.15905 11.841 6.66667 10 6.66667C8.15905 6.66667 6.66667 8.15905 6.66667 10C6.66667 11.841 8.15905 13.3333 10 13.3333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M16.6667 10C16.6667 13.6819 13.6819 16.6667 10 16.6667C6.3181 16.6667 3.33333 13.6819 3.33333 10C3.33333 6.3181 6.3181 3.33333 10 3.33333C13.6819 3.33333 16.6667 6.3181 16.6667 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      subMenu: [
        {
          name: 'Agents',
          view: 'agentCatalog',
          fullName: 'Catalog/Agents'
        },
        {
          name: 'Tools',
          view: 'toolChest',
          fullName: 'Catalog/Tools'
        },
        {
          name: 'SkillRecipes',
          view: 'SkillRecipes',
          fullName: 'Catalog/SkillRecipesView'
        },
        {
          name: 'Knowledge Assets',
          view: 'knowledgeAssetsCatalog',
          fullName: 'Catalog/Knowledge Assets',
          badge: 'BETA'
        },
        {
          name: 'Apps',
          view: 'appCatalog',
          fullName: 'Catalog/Apps',
          badge: 'BETA'
        }
//        {
//          name: 'Projects',
//          view: 'projects',
//          fullName: 'Catalog/Projects'
//        }
      ]
    },
    {
      name: 'Builder',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 13.3333C11.841 13.3333 13.3333 11.841 13.3333 10C13.3333 8.15905 11.841 6.66667 10 6.66667C8.15905 6.66667 6.66667 8.15905 6.66667 10C6.66667 11.841 8.15905 13.3333 10 13.3333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M16.6667 10C16.6667 13.6819 13.6819 16.6667 10 16.6667C6.3181 16.6667 3.33333 13.6819 3.33333 10C3.33333 6.3181 6.3181 3.33333 10 3.33333C13.6819 3.33333 16.6667 6.3181 16.6667 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M5 5L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      subMenu: [
        {
          name: 'Agent Builder',
          view: 'progressiveAgentBuilder',
          fullName: 'Builder/Progressive Agent Builder'
        },
        {
          name: 'Workflow Builder',
          view: 'workflowBuilder',
          fullName: 'Builder/Workflow Builder'
        },
        {
          name: 'Asset Builder',
          view: 'knowledgeAssetBuilder',
          fullName: 'Builder/Knowledge Asset',
          badge: 'BETA'
        }
      ]
    },
    {
      name: 'Wiki',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16.6667 13.3333H10M16.6667 6.66667H10M6.66667 6.66667H3.33333M6.66667 13.3333H3.33333M5 8.33333V5M5 15V11.6667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      view: 'knowledgeBase'
    },
    {
      name: 'Settings',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8.33333 2.5H11.6667M8.33333 17.5H11.6667M3.88767 5.55833L6.66667 7.22667M13.3333 12.7733L16.1123 14.4417M3.88767 14.4417L6.66667 12.7733M13.3333 7.22667L16.1123 5.55833M2.5 10H5M15 10H17.5M10 2.5V5M10 15V17.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      view: 'settings'
    }
  ];

  // Determine if a menu item is active
  const isActive = (item) => {
    if (item.subMenu) {
      return item.subMenu.some(subItem => activeNav === subItem.fullName);
    }
    return activeNav === item.name;
  };

  // Handle click on a menu item
  const handleMenuClick = (item) => {
    if (item.subMenu) {
      toggleGroup(item.name);
    } else if (item.view) {
      onNavClick(item.name);
    } else {
      onNavClick(item.name);
    }
  };

  // Handle click on a submenu item
  const handleSubMenuClick = (parentName, item) => {
    onNavClick(item.fullName, item.view);
  };

  return (
    <div className="sidebar">
      <div className="logo-title-container">
        <div className="logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 4L20 20" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <path d="M20 4L4 20" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <path fillRule="evenodd" clipRule="evenodd" d="M12 17C14.7614 17 17 14.7614 17 12C17 9.23858 14.7614 7 12 7C9.23858 7 7 9.23858 7 12C7 14.7614 9.23858 17 12 17ZM12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20Z" fill="white"/>
          </svg>
        </div>
        
        <div className="app-title">
          <h2>Artifi Agentic<br />Console</h2>
          <p>Commercial Insurance Accelerator</p>
        </div>
      </div>
      
      <div className="nav-menu">
        {menuStructure.map((item, index) => (
          <div key={index}>
            <div 
              className={`nav-item ${isActive(item) ? 'active' : ''}`}
              onClick={() => handleMenuClick(item)}
            >
              {item.icon}
              <span>{item.name}</span>
              {item.subMenu && (
                <span className="submenu-arrow">
                  {expandedGroups[item.name] ? '▼' : '▶'}
                </span>
              )}
            </div>
            
            {item.subMenu && expandedGroups[item.name] && (
              <div className="submenu">
                {item.subMenu.map((subItem, subIndex) => (
                  <div 
                    key={subIndex} 
                    className={`submenu-item ${activeNav === subItem.fullName ? 'active' : ''}`}
                    onClick={() => handleSubMenuClick(item.name, subItem)}
                  >
                    <span>{subItem.name}</span>
                    {subItem.badge && (
                      <span className="feature-badge" style={{
                        marginLeft: 'auto',
                        padding: '0.125rem 0.375rem',
                        borderRadius: '4px',
                        backgroundColor: '#334155',
                        color: 'white',
                        fontSize: '0.6875rem',
                        fontWeight: '500'
                      }}>
                        {subItem.badge}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="user-info">
        <div className="user-plan">Enterprise plan</div>
        <div className="user-email">username@artifi.ai</div>
      </div>
    </div>
  );
};

export default Sidebar;