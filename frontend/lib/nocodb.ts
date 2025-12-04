import { Api } from 'nocodb-sdk';

// NocoDB configuration
const NOCODB_API_URL = process.env.NEXT_PUBLIC_NOCODB_API_URL || 'http://localhost:8080';
const NOCODB_API_TOKEN = process.env.NEXT_PUBLIC_NOCODB_API_TOKEN || '';

// Create NocoDB API instance
export const nocodbApi = new Api({
  baseURL: NOCODB_API_URL,
  headers: {
    'xc-token': NOCODB_API_TOKEN,
  },
});

// Types
export interface NocoDBTable {
  id?: string;
  title?: string;
  table_name?: string;
  type?: string;
  enabled?: boolean;
  base_id?: string;
  project_id?: string;
  order?: number;
  columns?: NocoDBColumn[];
}

export interface NocoDBColumn {
  id: string;
  title: string;
  column_name: string;
  uidt: string; // UI Data Type
  dt?: string; // Database Type
  np?: string;
  ns?: string;
  clen?: string | number;
  cop?: string;
  pk?: boolean;
  pv?: boolean;
  rqd?: boolean;
  un?: boolean;
  ct?: string;
  ai?: boolean;
  unique?: boolean;
  cdf?: string;
  cc?: string;
  csn?: string;
  dtx?: string;
  dtxp?: string;
  dtxs?: string;
  au?: boolean;
  validate?: boolean;
  virtual?: boolean;
  system?: boolean;
  order?: number;
}

export interface NocoDBRecord {
  [key: string]: unknown;
}

export interface NocoDBListResponse {
  list: NocoDBRecord[];
  pageInfo: {
    totalRows?: number;
    page?: number;
    pageSize?: number;
    isFirstPage?: boolean;
    isLastPage?: boolean;
  };
}

// NocoDB API methods
export const nocodbService = {
  // Get all bases (projects)
  async getBases(): Promise<NocoDBTable[]> {
    try {
      const response = await nocodbApi.base.list();
      return (response.list || []) as NocoDBTable[];
    } catch (error) {
      console.error('Error fetching NocoDB bases:', error);
      return [];
    }
  },

  // Get all tables in a base
  async getTables(baseId: string): Promise<NocoDBTable[]> {
    try {
      const response = await nocodbApi.dbTable.list(baseId);
      return (response.list || []) as NocoDBTable[];
    } catch (error) {
      console.error('Error fetching NocoDB tables:', error);
      return [];
    }
  },

  // Get table metadata
  async getTableMetadata(tableId: string): Promise<NocoDBTable | null> {
    try {
      const response = await nocodbApi.dbTable.read(tableId);
      return response as NocoDBTable;
    } catch (error) {
      console.error('Error fetching table metadata:', error);
      return null;
    }
  },

  // Get records from a table
  async getRecords(
    baseId: string,
    tableName: string,
    params?: {
      limit?: number;
      offset?: number;
      where?: string;
      sort?: string;
      fields?: string[];
    }
  ): Promise<NocoDBListResponse> {
    try {
      const response = await nocodbApi.dbTableRow.list(
        'noco',
        baseId,
        tableName,
        params
      );
      return response as NocoDBListResponse;
    } catch (error) {
      console.error('Error fetching records:', error);
      return { list: [], pageInfo: {} };
    }
  },

  // Get a single record
  async getRecord(
    baseId: string,
    tableName: string,
    recordId: string
  ): Promise<NocoDBRecord | null> {
    try {
      const response = await nocodbApi.dbTableRow.read(
        'noco',
        baseId,
        tableName,
        recordId
      );
      return response as NocoDBRecord;
    } catch (error) {
      console.error('Error fetching record:', error);
      return null;
    }
  },

  // Create a record
  async createRecord(
    baseId: string,
    tableName: string,
    data: Record<string, unknown>
  ): Promise<NocoDBRecord | null> {
    try {
      const response = await nocodbApi.dbTableRow.create(
        'noco',
        baseId,
        tableName,
        data
      );
      return response as NocoDBRecord;
    } catch (error) {
      console.error('Error creating record:', error);
      throw error;
    }
  },

  // Update a record
  async updateRecord(
    baseId: string,
    tableName: string,
    recordId: string,
    data: Record<string, unknown>
  ): Promise<NocoDBRecord | null> {
    try {
      const response = await nocodbApi.dbTableRow.update(
        'noco',
        baseId,
        tableName,
        recordId,
        data
      );
      return response as NocoDBRecord;
    } catch (error) {
      console.error('Error updating record:', error);
      throw error;
    }
  },

  // Delete a record
  async deleteRecord(
    baseId: string,
    tableName: string,
    recordId: string
  ): Promise<boolean> {
    try {
      await nocodbApi.dbTableRow.delete(
        'noco',
        baseId,
        tableName,
        recordId
      );
      return true;
    } catch (error) {
      console.error('Error deleting record:', error);
      throw error;
    }
  },

  // Get record count
  async getRecordCount(
    baseId: string,
    tableName: string
  ): Promise<number> {
    try {
      const response = await nocodbApi.dbTableRow.list(
        'noco',
        baseId,
        tableName,
        { limit: 1 }
      );
      return response.pageInfo?.totalRows || 0;
    } catch (error) {
      console.error('Error fetching record count:', error);
      return 0;
    }
  },
};
