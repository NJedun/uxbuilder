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
  // GET - List all seed products
  if (req.method === 'GET') {
    try {
      const tableClient = getTableClient();
      const entities: any[] = [];
      const queryResults = tableClient.listEntities({
        queryOptions: { filter: "PartitionKey eq 'SeedProduct'" }
      });

      for await (const entity of queryResults) {
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

  // POST - Create a new seed product
  if (req.method === 'POST') {
    try {
      const productData = req.body;

      if (!productData || !productData.name) {
        return res.status(400).json({ error: 'Missing product data or name' });
      }

      const tableClient = getTableClient();

      // Create table if it doesn't exist
      try {
        await tableClient.createTable();
      } catch (err: any) {
        if (err.statusCode !== 409) {
          console.log('Table creation note:', err.message);
        }
      }

      // Generate unique row key using timestamp and product name
      const timestamp = Date.now();
      const sanitizedName = productData.name.replace(/[^a-zA-Z0-9]/g, '_');
      const rowKey = `${sanitizedName}_${timestamp}`;

      // Prepare entity for Azure Table Storage
      const entity = {
        partitionKey: 'SeedProduct',
        rowKey: rowKey,
        name: productData.name,
        description: productData.description || '',
        category: productData.category || 'Soybean',
        isActive: productData.isActive || false,
        rating: JSON.stringify(productData.rating || {}),
        productCharacteristics: JSON.stringify(productData.productCharacteristics || {}),
        createdAt: new Date().toISOString(),
      };

      await tableClient.createEntity(entity);

      return res.status(200).json({
        success: true,
        message: 'Product saved successfully',
        rowKey: rowKey
      });
    } catch (error: any) {
      console.error('Azure Table Storage error:', error);
      return res.status(500).json({ error: error.message || 'Failed to save product' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
