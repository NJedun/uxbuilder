import type { VercelRequest, VercelResponse } from '@vercel/node';
import { TableClient, AzureNamedKeyCredential } from '@azure/data-tables';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const accountName = process.env.AZURE_STORAGE_ACCOUNT;
  const accountKey = process.env.AZURE_STORAGE_KEY;
  const tableName = process.env.AZURE_TABLE_NAME;

  if (!accountName || !accountKey || !tableName) {
    return res.status(500).json({ error: 'Azure Table Storage not configured' });
  }

  try {
    const productData = req.body;

    if (!productData || !productData.name) {
      return res.status(400).json({ error: 'Missing product data or name' });
    }

    // Create table client
    const credential = new AzureNamedKeyCredential(accountName, accountKey);
    const tableClient = new TableClient(
      `https://${accountName}.table.core.windows.net`,
      tableName,
      credential
    );

    // Create table if it doesn't exist
    try {
      await tableClient.createTable();
    } catch (err: any) {
      // Table might already exist, ignore error
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

    // Insert entity
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
