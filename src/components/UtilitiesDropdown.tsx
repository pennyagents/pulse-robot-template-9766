
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ExternalLink, Settings } from 'lucide-react';

interface Utility {
  id: string;
  name: string;
  url: string;
  description?: string;
  is_active: boolean;
}

const UtilitiesDropdown = () => {
  const { data: utilities = [] } = useQuery({
    queryKey: ['utilities-public'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('utilities')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data as Utility[];
    }
  });

  if (utilities.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          <span>Utilities</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {utilities.map((utility) => (
          <DropdownMenuItem key={utility.id} asChild>
            <a
              href={utility.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between w-full cursor-pointer"
            >
              <div className="flex flex-col">
                <span className="font-medium">{utility.name}</span>
                {utility.description && (
                  <span className="text-xs text-muted-foreground">
                    {utility.description}
                  </span>
                )}
              </div>
              <ExternalLink className="h-3 w-3" />
            </a>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UtilitiesDropdown;
