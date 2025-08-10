// Configuration untuk menu sidebar dengan struktur tree
const sidebarConfig = {
  title: "🔧 DevTools",
  menuItems: [
    { 
      path: "index.html", 
      title: "Home", 
      icon: "🏠", 
      page: "home" 
    },
    { 
      path: "pages/formatter.html", 
      title: "Formatter", 
      icon: "🔤", 
      page: "formatter" 
    },
    // { 
    //   title: "Code Formatter", 
    //   icon: "🔤", 
    //   page: "formatter",
    //   children: [
    //     { path: "pages/formatter/javascript.html", title: "JavaScript", icon: "📄", page: "formatter-javascript" },
    //     { path: "pages/formatter/css.html", title: "CSS", icon: "📄", page: "formatter-css" },
    //     { path: "pages/formatter/html.html", title: "HTML", icon: "📄", page: "formatter-html" },
    //     { path: "pages/formatter/c++.html", title: "C++", icon: "📄", page: "formatter-cpp" },
    //     { path: "pages/formatter/python.html", title: "Python", icon: "📄", page: "formatter-python" }
    //   ]
    // },
   
     { 
      path: "pages/json-compare.html", 
      title: "Json compare", 
      icon: "🔐", 
      page: "json-compare" 
    },
    { 
      path: "pages/base64.html", 
      title: "Base64", 
      icon: "🔐", 
      page: "base64" 
    },
    { 
      path: "pages/json-viewer.html", 
      title: "JSON Viewer", 
      icon: "📊", 
      page: "json-viewer" 
    }
  ]
};

function generateSidebarTemplate(rootPath = './') {
  const menuHTML = sidebarConfig.menuItems.map(item => {
    if (item.children && item.children.length > 0) {
      // Menu dengan submenu (tree view)
      const childrenHTML = item.children.map(child => `
        <li class="ml-6">
          <a href="${rootPath}${child.path}" class="nav-link flex items-center space-x-1 rounded hover:bg-gray-700 transition text-sm" data-page="${child.page}">
            <span class="text-gray-400">${child.icon}</span>
            <span>${child.title}</span>
          </a>
        </li>
      `).join('');

      return `
        <li class="menu-group">
          <div class="menu-parent flex items-center space-x-3 p-3 rounded hover:bg-gray-700 transition cursor-pointer" data-page="${item.page}">
            <span class="expand-icon transition-transform duration-200">▶</span>
            <span>${item.icon}</span>
            <span>${item.title}</span>
          </div>
          <ul class="submenu space-y-1 mt-2 hidden">
            ${childrenHTML}
          </ul>
        </li>
      `;
    } else {
      // Menu biasa tanpa submenu
      return `
        <li>
          <a href="${rootPath}${item.path}" class="nav-link flex items-center space-x-3 p-3 rounded hover:bg-gray-700 transition" data-page="${item.page}">
            <span>${item.icon}</span>
            <span>${item.title}</span>
          </a>
        </li>
      `;
    }
  }).join('');

  return `
    <aside class="w-64 bg-gray-900 text-white min-h-full p-6 fixed inset-y-0 left-0">
      <div class="logo mb-8">
        <h2 class="text-2xl font-bold text-teal-400">${sidebarConfig.title}</h2>
      </div>
      <nav class="menu">
        <ul class="space-y-4">
          ${menuHTML}
        </ul>
      </nav>
    </aside>
  `;
}

function renderSidebar(currentPage = 'home', isSubPage = false) {
  const rootPath = isSubPage ? '../' : './';
  const sidebarHTML = generateSidebarTemplate(rootPath);
  
  document.getElementById('sidebar-container').innerHTML = sidebarHTML;
  
  // Setup tree view functionality
  setupTreeView();
  
  // Set active state
  setActiveState(currentPage);
}

function setupTreeView() {
  const menuParents = document.querySelectorAll('.menu-parent');
  
  menuParents.forEach(parent => {
    parent.addEventListener('click', function() {
      const submenu = this.nextElementSibling;
      const expandIcon = this.querySelector('.expand-icon');
      
      if (submenu && submenu.classList.contains('submenu')) {
        submenu.classList.toggle('hidden');
        expandIcon.style.transform = submenu.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(90deg)';
      }
    });
  });
}

function setActiveState(currentPage) {
  // Reset all active states
  const navLinks = document.querySelectorAll('.nav-link');
  const menuParents = document.querySelectorAll('.menu-parent');
  
  navLinks.forEach(link => {
    link.classList.remove('bg-teal-600', 'text-white');
    link.classList.add('hover:bg-gray-700');
  });
  
  menuParents.forEach(parent => {
    parent.classList.remove('bg-teal-600', 'text-white');
    parent.classList.add('hover:bg-gray-700');
  });
  
  // Set active state for current page
  const activeLink = document.querySelector(`[data-page="${currentPage}"]`);
  if (activeLink) {
    activeLink.classList.add('bg-teal-600', 'text-white');
    activeLink.classList.remove('hover:bg-gray-700');
    
    // If it's a submenu item, expand parent and highlight parent
    const submenu = activeLink.closest('.submenu');
    if (submenu) {
      const menuGroup = submenu.closest('.menu-group');
      const menuParent = menuGroup.querySelector('.menu-parent');
      const expandIcon = menuParent.querySelector('.expand-icon');
      
      // Expand parent menu
      submenu.classList.remove('hidden');
      expandIcon.style.transform = 'rotate(90deg)';
      
      // Add subtle highlight to parent
      menuParent.classList.add('bg-gray-800');
    }
  }
}

// Auto-detect current page and render sidebar
function autoRenderSidebar() {
  const path = window.location.pathname;
  let currentPage = 'home';
  let isSubPage = false;
  
  // Deteksi apakah berada di subfolder pages/
  isSubPage = path.includes('/pages/');
  
  // Ekstrak nama file tanpa ekstensi
  const fileName = path.split('/').pop().replace('.html', '');
  
  // Cari page berdasarkan konfigurasi menu (termasuk children)
  let foundPage = null;
  
  for (const item of sidebarConfig.menuItems) {
    // Cek di level utama
    if (item.path && (item.path.includes(fileName) || item.page === fileName)) {
      foundPage = item;
      break;
    }
    
    // Cek di children jika ada
    if (item.children) {
      const childMatch = item.children.find(child => 
        child.path.includes(fileName) || child.page === fileName
      );
      if (childMatch) {
        foundPage = childMatch;
        break;
      }
    }
  }
  
  currentPage = foundPage ? foundPage.page : 'home';
  
  console.log('Current path:', path);
  console.log('File name:', fileName);
  console.log('Is sub page:', isSubPage);
  console.log('Current page:', currentPage);
  
  renderSidebar(currentPage, isSubPage);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', autoRenderSidebar);