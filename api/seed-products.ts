import type { VercelRequest, VercelResponse } from '@vercel/node';
import { TableClient, AzureNamedKeyCredential } from '@azure/data-tables';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const accountName = process.env.AZURE_STORAGE_ACCOUNT;
  const accountKey = process.env.AZURE_STORAGE_KEY;
  const tableName = process.env.AZURE_TABLE_NAME;

  if (!accountName || !accountKey || !tableName) {
    return res.status(500).json({ error: 'Azure Table Storage not configured' });
  }

  try {
    const credential = new AzureNamedKeyCredential(accountName, accountKey);
    const tableClient = new TableClient(
      `https://${accountName}.table.core.windows.net`,
      tableName,
      credential
    );

    const entities: any[] = [];
    const queryResults = tableClient.listEntities({
      queryOptions: { filter: "PartitionKey eq 'SeedProduct'" }
    });

    for await (const entity of queryResults) {
      // Parse JSON strings back to objects
      entities.push({
        rowKey: entity.rowKey,
        name: entity.name,
        description: entity.description,
        category: entity.category,
        isActive: entity.isActive,
        rating: entity.rating ? JSON.parse(entity.rating as string) : {},
        productCharacteristics: entity.productCharacteristics ? JSON.parse(entity.productCharacteristics as string) : {},
        createdAt: entity.createdAt,
      });
    }

    return res.status(200).json({
      success: true,
      count: entities.length,
      data: entities
    });
  } catch (error: any) {
    console.error('Azure Table Storage error:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch products' });
  }
}
