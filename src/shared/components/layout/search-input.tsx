"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Search, User } from "lucide-react";

import { createClient } from "@/shared/lib/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Input } from "@/shared/components/ui/input";
interface SearchResult {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  role: string;
  job_title?: string;
  department_name?: string;
}

interface SupabaseProfileResult {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  role: string;
  employee_profiles: {
    job_title: string;
    departments: {
      name: string;
    } | {
      name: string;
    }[];
  } | {
    job_title: string;
    departments: {
      name: string;
    } | {
      name: string;
    }[];
  }[];
}

export function SearchInput() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search logic
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const delayDebounceFn = setTimeout(async () => {
      try {
        const supabase = createClient();
        // Fetch profiles matching full_name or email, joining employee_profiles and departments
        const { data, error } = await supabase
          .from("profiles")
          .select(`
            id,
            full_name,
            email,
            avatar_url,
            role,
            employee_profiles (
              job_title,
              departments (
                name
              )
            )
          `)
          .or(`full_name.ilike.%${trimmed}%,email.ilike.%${trimmed}%`)
          .limit(5);

        if (error) {
          console.error("Search error:", error);
          setResults([]);
        } else if (data) {
          const formatted: SearchResult[] = (data as unknown as SupabaseProfileResult[]).map((item) => {
            const empProfile = Array.isArray(item.employee_profiles)
              ? item.employee_profiles[0]
              : item.employee_profiles;
            const dept = empProfile?.departments;
            const deptName = Array.isArray(dept) ? dept[0]?.name : dept?.name;

            return {
              id: item.id,
              full_name: item.full_name,
              email: item.email,
              avatar_url: item.avatar_url,
              role: item.role,
              job_title: empProfile?.job_title,
              department_name: deptName,
            };
          });
          setResults(formatted);
        }
      } catch (err) {
        console.error("Failed to fetch search results", err);
      } finally {
        setLoading(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSelect = (userId: string) => {
    setOpen(false);
    setQuery("");
    router.push(`/employees/${userId}`);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-sm">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search employees..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          className="w-full pl-9 pr-9"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </div>

      {open && (query.trim().length >= 2 || results.length > 0) && (
        <div className="absolute top-full z-50 mt-1 w-full rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md outline-none animate-in fade-in-50 slide-in-from-top-1">
          {loading && results.length === 0 ? (
            <div className="flex items-center justify-center p-4 text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Searching...
            </div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No results found.
            </div>
          ) : (
            <ul className="max-h-[300px] overflow-y-auto">
              {results.map((user) => (
                <li key={user.id}>
                  <button
                    onClick={() => handleSelect(user.id)}
                    className="flex w-full items-center gap-3 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground outline-none"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar_url ?? undefined} alt={user.full_name} />
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{user.full_name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user.job_title ? `${user.job_title} • ` : ""}
                        {user.department_name ?? user.role}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
