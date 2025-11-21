import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function CategoriesBar({ onCategorySelect, selectedCategory }) {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => base44.entities.Category.list('order'),
  });

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const mainCategories = categories.filter(c => !c.parentId && c.active);

  const handleCategoryClick = (catName, hasSubcategories) => {
    if (isMobile && hasSubcategories) {
      setOpenDropdown(openDropdown === catName ? null : catName);
    } else if (!hasSubcategories) {
      onCategorySelect(catName);
    }
  };

  return (
    <nav className="categoria-bar">
      <style>{`
        .categoria-bar {
          background: #fff;
          border-bottom: 2px solid #E10600;
          padding: 8px 20px;
          margin-bottom: 20px;
        }

        .menu-categorie {
          list-style: none;
          display: flex;
          gap: 25px;
          margin: 0;
          padding: 0;
          overflow-x: auto;
        }

        .voce-categoria {
          position: relative;
          font-size: 15px;
          cursor: pointer;
          white-space: nowrap;
        }

        .voce-categoria > span {
          padding: 6px 12px;
          display: inline-block;
          font-weight: 600;
          color: #E10600;
          transition: background 0.2s;
          border-radius: 6px;
        }

        .voce-categoria:hover > span,
        .voce-categoria.active > span {
          background: #FFD500;
        }

        .dropdown-sottocategorie {
          display: none;
          position: absolute;
          top: 100%;
          left: 0;
          background: white;
          border: 2px solid #E10600;
          padding: 8px 0;
          list-style: none;
          min-width: 180px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          z-index: 100;
          border-radius: 8px;
          margin-top: 4px;
        }

        .voce-categoria:hover .dropdown-sottocategorie {
          display: block;
        }

        .voce-categoria.open .dropdown-sottocategorie {
          display: block;
        }

        .dropdown-sottocategorie li {
          margin: 0;
        }

        .dropdown-sottocategorie a {
          display: block;
          padding: 10px 16px;
          font-size: 14px;
          text-decoration: none;
          color: #E10600;
          transition: background 0.2s;
        }

        .dropdown-sottocategorie a:hover {
          background: #FFD500;
        }

        .btn-tutte {
          padding: 6px 16px;
          background: #FFD500;
          color: #E10600;
          border: 2px solid #E10600;
          border-radius: 6px;
          font-weight: 600;
          font-size: 15px;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s;
        }

        .btn-tutte:hover {
          background: #E10600;
          color: white;
        }

        .btn-tutte.active {
          background: #E10600;
          color: white;
        }

        @media (max-width: 768px) {
          .menu-categorie {
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }
        }
      `}</style>

      <ul className="menu-categorie">
        <li>
          <button
            onClick={() => onCategorySelect('all')}
            className={`btn-tutte ${selectedCategory === 'all' ? 'active' : ''}`}
          >
            Tutte
          </button>
        </li>

        {mainCategories.map((cat) => {
          const subCategories = categories.filter(c => c.parentId === cat.id && c.active);
          const isOpen = openDropdown === cat.name;
          
          return (
            <li 
              key={cat.id} 
              className={`voce-categoria ${isOpen ? 'open' : ''} ${selectedCategory === cat.name ? 'active' : ''}`}
              onMouseEnter={() => !isMobile && subCategories.length > 0 && setOpenDropdown(cat.name)}
              onMouseLeave={() => !isMobile && setOpenDropdown(null)}
            >
              <span onClick={() => handleCategoryClick(cat.name, subCategories.length > 0)}>
                {cat.name}
              </span>
              {subCategories.length > 0 && (
                <ul className="dropdown-sottocategorie">
                  {subCategories.map((sub) => (
                    <li key={sub.id}>
                      <a 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault();
                          onCategorySelect(sub.name);
                          setOpenDropdown(null);
                        }}
                      >
                        {sub.name}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}