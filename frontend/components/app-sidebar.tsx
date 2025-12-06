"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Database,
  ChevronDown,
  Table as TableIcon,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { nocodbService, type NocoDBTable } from "@/lib/nocodb";

export function AppSidebar() {
  const pathname = usePathname();
  const [nocodbTables, setNocodbTables] = useState<NocoDBTable[]>([]);
  const [nocodbLoading, setNocodbLoading] = useState(true);

  useEffect(() => {
    const fetchNocodbData = async () => {
      try {
        // First get the bases (projects)
        const bases = await nocodbService.getBases();
        if (bases.length > 0 && bases[0].id) {
          const baseId = bases[0].id;
          
          // Then get tables for the first base
          const tables = await nocodbService.getTables(baseId);
          
          // Get row counts for each table
          const tablesWithCounts = await Promise.all(
            tables.map(async (table) => {
              if (table.table_name && baseId) {
                const count = await nocodbService.getRecordCount(
                  baseId,
                  table.table_name
                );
                return { ...table, rowCount: count };
              }
              return { ...table, rowCount: 0 };
            })
          );
          
          setNocodbTables(tablesWithCounts);
        }
      } catch (error) {
        console.error("Failed to fetch NocoDB data:", error);
      } finally {
        setNocodbLoading(false);
      }
    };

    fetchNocodbData();
  }, []);

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            🚀
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">Dynamic Forms</span>
            <span className="text-xs text-muted-foreground">CMS System</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>NocoDB</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <Collapsible defaultOpen className="group/nocodb">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton>
                      <Database className="h-4 w-4" />
                      <span>Tables</span>
                      <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/nocodb:rotate-180" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {nocodbLoading ? (
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton>
                            <span className="text-muted-foreground">Loading...</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ) : nocodbTables.length === 0 ? (
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton>
                            <span className="text-muted-foreground">No tables</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ) : (
                        nocodbTables.map((table) => (
                          <SidebarMenuSubItem key={table.id}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={pathname === `/nocodb/${table.table_name}`}
                            >
                              <Link href={`/nocodb/${table.table_name}`}>
                                <TableIcon className="h-3 w-3" />
                                <span>{table.title || table.table_name}</span>
                                {(table as NocoDBTable & { rowCount?: number }).rowCount !== undefined && (
                                  <span className="ml-auto text-xs text-muted-foreground">
                                    {(table as NocoDBTable & { rowCount?: number }).rowCount}
                                  </span>
                                )}
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))
                      )}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="p-4 text-xs text-muted-foreground">
          <p>Content Management System</p>
          <p className="mt-1">v1.0.0</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
