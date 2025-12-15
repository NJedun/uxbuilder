import type { VercelRequest, VercelResponse } from '@vercel/node';
import { TableClient, AzureNamedKeyCredential } from '@azure/data-tables';

function getTableClient() {
  const accountName = process.env.AZURE_STORAGE_ACCOUNT;
  const accountKey = process.env.AZURE_STORAGE_KEY;
  const tableName = process.env.AZURE_TABLE_NAME;

  if (!accountName || !accountKey || !tableName) {
    throw new Error('Azure Table Storage not configured');
  }

  const credential = new AzureNamedKeyCredential(accountName, accountKey);
  return new TableClient(
    `https://${accountName}.table.core.windows.net`,
    tableName,
    credential
  );
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const tableClient = getTableClient();
    const projects = new Set<string>();

    // Get all entities and extract unique partitionKeys
    const queryResults = tableClient.listEntities({
      queryOptions: { filter: "PartitionKey ne 'SeedProduct'" },
    });

    for await (const entity of queryResults) {
      projects.add(entity.partitionKey as string);
    }

    return res.status(200).json({
      success: true,
      count: projects.size,
      data: Array.from(projects),
    });
  } catch (error: any) {
    console.error('Projects fetch error:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch projects' });
  }
}
