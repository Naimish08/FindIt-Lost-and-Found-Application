type TableName = 'users' | 'posts' | 'claims' | 'notifications'

export class SupabaseClientMock {
  async insert(table: TableName, payload: unknown): Promise<{ ok: boolean; data: unknown }> {
    return { ok: true, data: { table, payload } }
  }

  async update(table: TableName, payload: unknown): Promise<{ ok: boolean; data: unknown }> {
    return { ok: true, data: { table, payload } }
  }

  async delete(table: TableName, payload: unknown): Promise<{ ok: boolean; data: unknown }> {
    return { ok: true, data: { table, payload } }
  }

  async select(table: TableName, query: unknown): Promise<{ ok: boolean; data: unknown[] }> {
    return { ok: true, data: [{ table, query }] }
  }
}

