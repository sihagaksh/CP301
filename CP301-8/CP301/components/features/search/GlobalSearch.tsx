'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search as SearchIcon, 
  Loader2, 
  Calendar, 
  Store, 
  Users, 
  Box, 
  FileText, 
  Megaphone, 
  Building2,
  Link
} from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import { searchGlobal, type GlobalSearchResult } from '@/lib/db/search';

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';

export function GlobalSearch() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [results, setResults] = React.useState<GlobalSearchResult[]>([]);
  const [loading, setLoading] = React.useState(false);

  const debouncedQuery = useDebounce(query, 300);

  // Toggle Command Palette with Cmd+K / Ctrl+K
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // Fetch FTS search results natively when debounced query fires
  React.useEffect(() => {
    async function fetchResults() {
      if (!debouncedQuery || debouncedQuery.length < 2) {
        setResults([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const data = await searchGlobal(debouncedQuery);
        setResults(data);
      } catch (err) {
        console.error('Search error', err);
      } finally {
        setLoading(false);
      }
    }

    fetchResults();
  }, [debouncedQuery]);

  // Group results by module for rendering categories seamlessly
  const groupedResults = React.useMemo(() => {
    const map: Record<string, GlobalSearchResult[]> = {};
    results.forEach((r) => {
      if (!map[r.module]) map[r.module] = [];
      map[r.module].push(r);
    });
    return map;
  }, [results]);

  const onSelectResult = (url: string) => {
    setOpen(false);
    setQuery('');
    router.push(url);
  };

  const getModuleConfig = (moduleName: string) => {
    switch (moduleName) {
      case 'Event': return { icon: Calendar, color: 'text-blue-500' };
      case 'Marketplace': return { icon: Store, color: 'text-green-500' };
      case 'Community': return { icon: Users, color: 'text-purple-500' };
      case 'Lost & Found': return { icon: Box, color: 'text-orange-500' };
      case 'Blog': return { icon: FileText, color: 'text-pink-500' };
      case 'Notice': return { icon: Megaphone, color: 'text-red-500' };
      case 'Organization': return { icon: Building2, color: 'text-indigo-500' };
      case 'Quick Link': return { icon: Link, color: 'text-yellow-600' };
      default: return { icon: SearchIcon, color: 'text-muted-foreground' };
    }
  };

  return (
    <>
      <div 
        className="relative w-full max-w-md hidden md:flex items-center cursor-text group"
        onClick={() => setOpen(true)}
      >
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        <div className="w-full pl-10 pr-4 py-2 text-sm text-muted-foreground rounded-lg border border-border bg-background shadow-sm group-hover:border-indigo-500/50 transition-all flex items-center justify-between">
          <span>Search campus...</span>
          <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <span className="text-xs">⌘</span>K
          </kbd>
        </div>
      </div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput 
          placeholder="Search for events, communities, items..." 
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          {loading && (
            <div className="p-6 flex items-center justify-center text-sm text-muted-foreground gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Searching database...
            </div>
          )}
          {!loading && query.length > 0 && results.length === 0 && (
            <CommandEmpty>No results found for "{query}".</CommandEmpty>
          )}

          {!loading && Object.keys(groupedResults).map((moduleName) => (
            <CommandGroup key={moduleName} heading={moduleName}>
              {groupedResults[moduleName].map((res) => {
                const ModuleIcon = getModuleConfig(res.module).icon;
                const iconColor = getModuleConfig(res.module).color;
                return (
                  <CommandItem
                    key={res.id}
                    value={`${res.title} ${res.snippet}`} // cmkd filters by value natively, so provide full text
                    onSelect={() => onSelectResult(res.link_url)}
                    className="flex flex-row items-center px-4 py-3 cursor-pointer gap-4"
                  >
                    <div className={`p-2 rounded-md bg-muted/50 ${iconColor}`}>
                      <ModuleIcon className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col items-start flex-1 overflow-hidden">
                      <span className="font-semibold text-foreground truncate w-full">
                        {res.title}
                      </span>
                      {res.snippet && (
                        <span className="text-xs text-muted-foreground truncate w-full mt-0.5">
                          {res.snippet}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}
