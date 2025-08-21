'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'

interface NavigationItem {
  path: string
  name: string
  label: string
}

const navigationItems: NavigationItem[] = [
  { path: '/', name: '홈', label: '홈' },
  { path: '/convert', name: '변환', label: '변환' },
  { path: '/use', name: '사용법', label: '사용법' },
  { path: '/gallery', name: '업스케일링', label: '업스케일링' }
]

export default function ResponsiveNavigation() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  
  // 현재 페이지 정보 찾기
  const currentPage = navigationItems.find(item => item.path === pathname) || navigationItems[0]
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }
  
  const handleMenuItemClick = () => {
    setIsMenuOpen(false)
  }
  
  // ESC 키로 메뉴 닫기
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false)
      }
    }
    
    if (isMenuOpen) {
      document.addEventListener('keydown', handleEscapeKey)
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscapeKey)
    }
  }, [isMenuOpen])
  
  return (
    <>
      {/* Desktop Navigation */}
      <nav className="desktop-nav nav" style={{ justifyContent: 'center' }}>
        <a href="/">홈</a>
        <a href="/convert">변환</a>
        <a href="/use">사용법</a>
        <a href="/gallery">업스케일링</a>
      </nav>
      
      {/* Mobile Navigation */}
      <nav className="mobile-nav">
        <div className="mobile-nav-content">
          <div className="current-page">
            {currentPage.name}
          </div>
          <button 
            className="menu-button"
            onClick={toggleMenu}
            aria-label="메뉴 열기"
          >
            MENU
          </button>
        </div>
        
        {/* Dropdown Menu */}
        {isMenuOpen && (
          <>
            <div className="menu-overlay" onClick={toggleMenu} />
            <div className="dropdown-menu">
              {navigationItems.map((item) => (
                <a
                  key={item.path}
                  href={item.path}
                  className={`dropdown-item ${pathname === item.path ? 'active' : ''}`}
                  onClick={handleMenuItemClick}
                >
                  {item.label}
                </a>
              ))}
            </div>
          </>
        )}
      </nav>
    </>
  )
}