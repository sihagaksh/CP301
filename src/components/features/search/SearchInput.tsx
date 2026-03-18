'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Clock, X, ArrowRight } from 'lucide-react'
import { getSearchSuggestions, getSearchHistory } from '@/lib/db/search'
import { useDebounce } from '@/lib/hooks/useDebounce'

interface SearchInputProps {
  initialQuery?: string
  placeholder?: string
  size?: 'sm' | 'md' | 'lg'
  showSuggestions?: boolean
  onSearch?: (query: string) => void
  className?: string
}

export function SearchInput({
  initialQuery = '',
  placeholder = 'Search across all content...',
  size = 'md',
  showSuggestions = true,
  onSearch,
  className = ''
}: SearchInputProps) {
  const [query, setQuery] = useState(initialQuery)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)

  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const debouncedQuery = useDebounce(query, 300)

  // Size variants
  const sizeClasses = {
    sm: 'h-8 text-sm',
    md: 'h-10 text-sm',
    lg: 'h-12 text-base'
  }

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  // Load suggestions when query changes
  useEffect(() => {
    if (debouncedQuery && debouncedQuery.length >= 2 && showSuggestions) {
      setIsLoading(true)
      getSearchSuggestions(debouncedQuery)
        .then(setSuggestions)
        .finally(() => setIsLoading(false))
    } else {
      setSuggestions([])
    }
  }, [debouncedQuery, showSuggestions])

  // Load recent searches on focus
  useEffect(() => {
    if (isOpen && !query && showSuggestions) {
      // In a real app, you'd get the current user ID
      // For now, we'll use localStorage for recent searches
      const recent = JSON.parse(localStorage.getItem('recent_searches') || '[]')
      setRecentSearches(recent.slice(0, 5))
    }
  }, [isOpen, query, showSuggestions])

  // Handle clicks outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = (searchQuery: string) => {
    const trimmedQuery = searchQuery.trim()
    if (!trimmedQuery) return

    // Save to recent searches
    const recent = JSON.parse(localStorage.getItem('recent_searches') || '[]')
    const newRecent = [trimmedQuery, ...recent.filter((q: string) => q !== trimmedQuery)].slice(0, 10)
    localStorage.setItem('recent_searches', JSON.stringify(newRecent))

    // Perform search
    if (onSearch) {
      onSearch(trimmedQuery)
    } else {
      router.push(`/dashboard/search?q=${encodeURIComponent(trimmedQuery)}`)
    }

    setIsOpen(false)
    setSelectedIndex(-1)
    inputRef.current?.blur()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const items = query ? suggestions : recentSearches

    if (e.key === 'Escape') {
      setIsOpen(false)
      setSelectedIndex(-1)
      inputRef.current?.blur()
      return
    }

    if (e.key === 'Enter') {
      if (selectedIndex >= 0 && items[selectedIndex]) {
        setQuery(items[selectedIndex])
        handleSearch(items[selectedIndex])
      } else {
        handleSearch(query)
      }
      return
    }

    if (!isOpen) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => (prev < items.length - 1 ? prev + 1 : prev))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => (prev > -1 ? prev - 1 : -1))
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion)
    handleSearch(suggestion)
  }

  const handleClearQuery = () => {
    setQuery('')
    setSuggestions([])
    setSelectedIndex(-1)
    inputRef.current?.focus()
  }

  const clearRecentSearches = () => {
    localStorage.removeItem('recent_searches')
    setRecentSearches([])
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          <Search className={iconSizes[size]} />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setSelectedIndex(-1)
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full ${sizeClasses[size]} pl-10 ${query ? 'pr-20' : 'pr-4'} border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors`}
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
          {query && (
            <button
              onClick={handleClearQuery}
              className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          {query && (
            <button
              onClick={() => handleSearch(query)}
              className="text-amber-500 hover:text-amber-600 dark:text-amber-400 dark:hover:text-amber-300"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Suggestions Dropdown */}
      {isOpen && showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
          {/* Loading State */}
          {isLoading && (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
              <div className="animate-spin w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full mx-auto mb-2"></div>
              Searching...
            </div>
          )}

          {/* Suggestions */}
          {!isLoading && query && suggestions.length > 0 && (
            <div className="p-2">
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-3 py-2">
                Suggestions
              </div>
              {suggestions.map((suggestion, index) => (
                <button
                  key={suggestion}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    selectedIndex === index
                      ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Search className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">{suggestion}</span>
                </button>
              ))}
            </div>
          )}

          {/* Recent Searches */}
          {!isLoading && !query && recentSearches.length > 0 && (
            <div className="p-2">
              <div className="flex items-center justify-between px-3 py-2">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Recent Searches
                </div>
                <button
                  onClick={clearRecentSearches}
                  className="text-xs text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                >
                  Clear
                </button>
              </div>
              {recentSearches.map((search, index) => (
                <button
                  key={search}
                  onClick={() => handleSuggestionClick(search)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    selectedIndex === index
                      ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">{search}</span>
                </button>
              ))}
            </div>
          )}

          {/* No Results */}
          {!isLoading && query && query.length >= 2 && suggestions.length === 0 && (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
              No suggestions found for "{query}"
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !query && recentSearches.length === 0 && (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
              Start typing to search across all content
            </div>
          )}
        </div>
      )}
    </div>
  )
}