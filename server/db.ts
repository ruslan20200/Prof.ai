import { Pool, type QueryResult, type QueryResultRow } from 'pg';

let pool: Pool | null = null;

function resolveSsl() {
  const connectionString = process.env.DATABASE_URL ?? '';
  if (connectionString.includes('supabase.com')) {
    return { rejectUnauthorized: false } as const;
  }
  return undefined;
}

export function getPool(): Pool {
  if (pool) {
    return pool;
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is required to use the API.');
  }

  pool = new Pool({
    connectionString,
    ssl: resolveSsl(),
  });

  return pool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  sql: string,
  params: unknown[] = []
): Promise<QueryResult<T>> {
  return getPool().query<T>(sql, params);
}
