import type { VercelRequest, VercelResponse } from '@vercel/node';
import { TableClient, AzureNamedKeyCredential } from '@azure/data-tables';

function getPagesTableClient() {
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
  // Handle GET - List all pages
  if (req.method === 'GET') {
    try {
      const tableClient = getPagesTableClient();
      const { type, parentRowKey, project } = req.query;

      const entities: any[] = [];

      // Build filter query - always exclude SeedProduct partition
      const filters = ["PartitionKey ne 'SeedProduct'"];
      if (type) {
        filters.push(`pageType eq '${type}'`);
      }
      if (parentRowKey) {
        filters.push(`parentRowKey eq '${parentRowKey}'`);
      }
      if (project) {
        filters.push(`PartitionKey eq '${project}'`);
      }

      const filter = filters.join(' and ');
      const queryOptions = { filter };
      const queryResults = tableClient.listEntities({ queryOptions });

      for await (const entity of queryResults) {
        entities.push({
          rowKey: entity.rowKey,
          partitionKey: entity.partitionKey,
          pageType: entity.pageType,
          slug: entity.slug,
          parentRowKey: entity.parentRowKey || null,
          layoutRowKey: entity.layoutRowKey || null,
          title: entity.title,
          name: entity.name || entity.title,
          summary: entity.summary || '',
          description: entity.summary || '',
          category: entity.category || null,
          components: entity.components,
          sectionComponents: entity.sectionComponents || '{}',
          globalStyles: entity.globalStyles,
          // Layout-specific fields
          headerComponents: entity.headerComponents || '',
          footerComponents: entity.footerComponents || '',
          bodySections: entity.bodySections || '[]',
          headerStyles: entity.headerStyles || '',
          bodyStyles: entity.bodyStyles || '',
          footerStyles: entity.footerStyles || '',
          isDefault: entity.isDefault || false,
          isPublished: entity.isPublished || false,
          createdAt: entity.createdAt,
          updatedAt: entity.updatedAt,
        });
      }

      return res.status(200).json({
        success: true,
        count: entities.length,
        data: entities,
      });
    } catch (error: any) {
      console.error('Pages fetch error:', error);
      return res.status(500).json({ error: error.message || 'Failed to fetch pages' });
    }
  }

  // Handle POST - Create new page
  if (req.method === 'POST') {
    try {
      const tableClient = getPagesTableClient();

      // Create table if it doesn't exist
      try {
        await tableClient.createTable();
      } catch (err: any) {
        if (err.statusCode !== 409) {
          console.log('Table creation note:', err.message);
        }
      }

      const pageData = req.body;

      if (!pageData.partitionKey || !pageData.title) {
        return res.status(400).json({ error: 'Missing project (partitionKey) or title' });
      }

      // Generate unique row key
      const timestamp = Date.now();
      const sanitizedTitle = pageData.title.replace(/[^a-zA-Z0-9]/g, '_');
      const rowKey = `${sanitizedTitle}_${timestamp}`;

      const now = new Date().toISOString();

      const entity = {
        partitionKey: pageData.partitionKey,
        rowKey: rowKey,
        pageType: pageData.pageType || 'PDP',
        slug: pageData.slug,
        parentRowKey: pageData.parentRowKey || '',
        layoutRowKey: pageData.layoutRowKey || '',
        title: pageData.title,
        name: pageData.name || pageData.title,
        summary: pageData.summary || '',
        category: pageData.category || '',
        components: pageData.components || '[]',
        sectionComponents: pageData.sectionComponents || '{}',
        globalStyles: pageData.globalStyles || '{}',
        // Layout-specific fields
        headerComponents: pageData.headerComponents || '',
        footerComponents: pageData.footerComponents || '',
        bodySections: pageData.bodySections || '[]',
        headerStyles: pageData.headerStyles || '',
        bodyStyles: pageData.bodyStyles || '',
        footerStyles: pageData.footerStyles || '',
        isDefault: pageData.isDefault || false,
        isPublished: pageData.isPublished || false,
        createdAt: now,
        updatedAt: now,
      };

      await tableClient.createEntity(entity);

      return res.status(200).json({
        success: true,
        message: 'Page saved successfully',
        rowKey: rowKey,
        slug: pageData.slug,
      });
    } catch (error: any) {
      console.error('Page save error:', error);
      return res.status(500).json({ error: error.message || 'Failed to save page' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
