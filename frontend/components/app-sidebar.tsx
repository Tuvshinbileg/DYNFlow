"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  FileText,
  Settings,
  Database,
  ExternalLink,
  ChevronDown,
  Plus,
  Eye,
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
import { contentTypesApi } from "@/lib/api";
import type { ContentTypeListItem } from "@/lib/types";
import { nocodbService, type NocoDBTable } from "@/lib/nocodb";

const externalLinks = [
  {
    title: "Django Admin",
    url: "http://localhost:8000/admin/",
    icon: Settings,
  },
  {
    title: "API Docs",
    url: "http://localhost:8000/api/content-types/",
    icon: Database,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const [contentTypes, setContentTypes] = useState<ContentTypeListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [nocodbTables, setNocodbTables] = useState<NocoDBTable[]>([]);
  const [nocodbLoading, setNocodbLoading] = useState(true);
  const [nocodbBaseId, setNocodbBaseId] = useState<string>("");

  useEffect(() => {
    const fetchContentTypes = async () => {
      try {
        const data = await contentTypesApi.getAll();
        setContentTypes(data);
      } catch (error) {
        console.error("Failed to fetch content types:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContentTypes();
  }, []);

  useEffect(() => {
    const fetchNocodbData = async () => {
      try {
        // First get the bases (projects)
        const bases = await nocodbService.getBases();
        if (bases.length > 0 && bases[0].id) {
          const baseId = bases[0].id;
          setNocodbBaseId(baseId);
          
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
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/"}>
                  <Link href="/">
                    <Home className="h-4 w-4" />
                    <span>Home</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <Collapsible defaultOpen className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton>
                      <FileText className="h-4 w-4" />
                      <span>Content Types</span>
                      <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {isLoading ? (
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton>
                            <span className="text-muted-foreground">Loading...</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ) : contentTypes.length === 0 ? (
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton>
                            <span className="text-muted-foreground">No content types</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ) : (
                        contentTypes.map((contentType) => (
                          <Collapsible key={contentType.id} className="group/item">
                            <SidebarMenuSubItem>
                              <CollapsibleTrigger asChild>
                                <SidebarMenuSubButton>
                                  <FileText className="h-3 w-3" />
                                  <span>{contentType.display_name}</span>
                                  <ChevronDown className="ml-auto h-3 w-3 transition-transform group-data-[state=open]/item:rotate-180" />
                                </SidebarMenuSubButton>
                              </CollapsibleTrigger>
                              <CollapsibleContent>
                                <SidebarMenuSub>
                                  <SidebarMenuSubItem>
                                    <SidebarMenuSubButton
                                      asChild
                                      isActive={pathname === `/create/${contentType.name}`}
                                    >
                                      <Link href={`/create/${contentType.name}`}>
                                        <Plus className="h-3 w-3" />
                                        <span>Create</span>
                                      </Link>
                                    </SidebarMenuSubButton>
                                  </SidebarMenuSubItem>
                                  <SidebarMenuSubItem>
                                    <SidebarMenuSubButton
                                      asChild
                                      isActive={pathname === `/view/${contentType.name}`}
                                    >
                                      <Link href={`/view/${contentType.name}`}>
                                        <Eye className="h-3 w-3" />
                                        <span>View All</span>
                                      </Link>
                                    </SidebarMenuSubButton>
                                  </SidebarMenuSubItem>
                                </SidebarMenuSub>
                              </CollapsibleContent>
                            </SidebarMenuSubItem>
                          </Collapsible>
                        ))
                      )}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>NocoDB</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/nocodb"}>
                  <Link href="/nocodb">
                    <TableIcon className="h-4 w-4" />
                    <span>All Tables</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
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
        <SidebarGroup>
          <SidebarGroupLabel>External Links</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {externalLinks.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                      <ExternalLink className="ml-auto h-3 w-3" />
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
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
