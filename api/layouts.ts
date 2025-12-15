import type { VercelRequest, VercelResponse } from '@vercel/node';
import { TableClient, AzureNamedKeyCredential } from '@azure/data-tables';

const ROW_KEY_PREFIX = {
  layout: 'layout_',
  page: 'page_',
  settings: 'settings',
};

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

function createRowKey(entityType: string, name: string): string {
  const sanitizedName = name.replace(/[^a-zA-Z0-9]/g, '_');
  const timestamp = Date.now();
  return `${ROW_KEY_PREFIX[entityType as keyof typeof ROW_KEY_PREFIX]}${sanitizedName}_${timestamp}`;
}

function formatEntityResponse(entity: any) {
  return {
    rowKey: entity.rowKey,
    partitionKey: entity.partitionKey,
    entityType: entity.entityType || 'layout',
    pageType: entity.pageType,
    slug: entity.slug,
    parentRowKey: entity.parentRowKey || null,
    layoutRowKey: entity.layoutRowKey || null,
    title: entity.title,
    name: entity.name || entity.title,
    summary: entity.summary || '',
    category: entity.category || null,
    sectionComponents: entity.sectionComponents || '{}',
    globalStyles: entity.globalStyles || '{}',
    headerComponents: entity.headerComponents || '[]',
    footerComponents: entity.footerComponents || '[]',
    bodySections: entity.bodySections || '[]',
    headerStyles: entity.headerStyles || '{}',
    footerStyles: entity.footerStyles || '{}',
    isDefault: entity.isDefault || false,
    isPublished: entity.isPublished || false,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle GET - List all layouts
  if (req.method === 'GET') {
    try {
      const tableClient = getTableClient();
      const { project } = req.query;

      const entities: any[] = [];

      // Build filter query - only get layouts
      const filters = ["entityType eq 'layout'"];
      if (project) {
        filters.push(`PartitionKey eq '${project}'`);
      }

      const filter = filters.join(' and ');
      const queryOptions = { filter };
      const queryResults = tableClient.listEntities({ queryOptions });

      for await (const entity of queryResults) {
        entities.push(formatEntityResponse(entity));
      }

      return res.status(200).json({
        success: true,
        count: entities.length,
        data: entities,
      });
    } catch (error: any) {
      console.error('Layouts fetch error:', error);
      return res.status(500).json({ error: error.message || 'Failed to fetch layouts' });
    }
  }

  // Handle POST - Create new layout
  if (req.method === 'POST') {
    try {
      const tableClient = getTableClient();

      try {
        await tableClient.createTable();
      } catch (err: any) {
        if (err.statusCode !== 409) {
          console.log('Table creation note:', err.message);
        }
      }

      const layoutData = req.body;

      if (!layoutData.partitionKey || !layoutData.name) {
        return res.status(400).json({ error: 'Missing project (partitionKey) or name' });
      }

      const rowKey = createRowKey('layout', layoutData.name);
      const now = new Date().toISOString();

      const entity = {
        partitionKey: layoutData.partitionKey,
        rowKey: rowKey,
        entityType: 'layout',
        name: layoutData.name,
        title: layoutData.name,
        isDefault: layoutData.isDefault || false,
        headerComponents: layoutData.headerComponents || '[]',
        footerComponents: layoutData.footerComponents || '[]',
        bodySections: layoutData.bodySections || '[]',
        headerStyles: layoutData.headerStyles || '{}',
        footerStyles: layoutData.footerStyles || '{}',
        globalStyles: layoutData.globalStyles || '{}',
        isPublished: layoutData.isPublished || false,
        createdAt: now,
        updatedAt: now,
      };

      await tableClient.createEntity(entity);

      return res.status(200).json({
        success: true,
        message: 'Layout saved successfully',
        rowKey: rowKey,
      });
    } catch (error: any) {
      console.error('Layout save error:', error);
      return res.status(500).json({ error: error.message || 'Failed to save layout' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
