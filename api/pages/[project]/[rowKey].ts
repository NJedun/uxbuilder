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

function formatEntityResponse(entity: any) {
  return {
    rowKey: entity.rowKey,
    partitionKey: entity.partitionKey,
    entityType: entity.entityType || 'page',
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
  const { project, rowKey } = req.query;

  if (!project || !rowKey || typeof project !== 'string' || typeof rowKey !== 'string') {
    return res.status(400).json({ error: 'Missing project or rowKey' });
  }

  const tableClient = getTableClient();

  // GET - Get single entity (page or layout)
  if (req.method === 'GET') {
    try {
      const entity = await tableClient.getEntity(project, rowKey);

      return res.status(200).json({
        success: true,
        data: formatEntityResponse(entity),
      });
    } catch (error: any) {
      if (error.statusCode === 404) {
        return res.status(404).json({ error: 'Entity not found' });
      }
      console.error('Entity fetch error:', error);
      return res.status(500).json({ error: error.message || 'Failed to fetch entity' });
    }
  }

  // PUT - Update existing entity
  if (req.method === 'PUT') {
    try {
      const data = req.body;

      // Get existing entity first
      const existing = await tableClient.getEntity(project, rowKey);
      const entityType = existing.entityType || 'page';

      const entity: any = {
        partitionKey: project,
        rowKey: rowKey,
        entityType: entityType,
        pageType: data.pageType !== undefined ? data.pageType : existing.pageType,
        slug: data.slug !== undefined ? data.slug : existing.slug,
        parentRowKey: data.parentRowKey !== undefined ? data.parentRowKey : existing.parentRowKey,
        layoutRowKey: data.layoutRowKey !== undefined ? data.layoutRowKey : existing.layoutRowKey,
        title: data.title !== undefined ? data.title : existing.title,
        name: data.name !== undefined ? data.name : existing.name,
        summary: data.summary !== undefined ? data.summary : existing.summary,
        category: data.category !== undefined ? data.category : existing.category,
        sectionComponents: data.sectionComponents !== undefined ? data.sectionComponents : existing.sectionComponents,
        globalStyles: data.globalStyles !== undefined ? data.globalStyles : existing.globalStyles,
        headerComponents: data.headerComponents !== undefined ? data.headerComponents : existing.headerComponents,
        footerComponents: data.footerComponents !== undefined ? data.footerComponents : existing.footerComponents,
        bodySections: data.bodySections !== undefined ? data.bodySections : existing.bodySections,
        headerStyles: data.headerStyles !== undefined ? data.headerStyles : existing.headerStyles,
        footerStyles: data.footerStyles !== undefined ? data.footerStyles : existing.footerStyles,
        isDefault: data.isDefault !== undefined ? data.isDefault : existing.isDefault,
        isPublished: data.isPublished !== undefined ? data.isPublished : existing.isPublished,
        createdAt: existing.createdAt,
        updatedAt: new Date().toISOString(),
      };

      await tableClient.updateEntity(entity, 'Replace');

      return res.status(200).json({
        success: true,
        message: 'Entity updated successfully',
      });
    } catch (error: any) {
      if (error.statusCode === 404) {
        return res.status(404).json({ error: 'Entity not found' });
      }
      console.error('Entity update error:', error);
      return res.status(500).json({ error: error.message || 'Failed to update entity' });
    }
  }

  // DELETE - Delete entity
  if (req.method === 'DELETE') {
    try {
      await tableClient.deleteEntity(project, rowKey);

      return res.status(200).json({
        success: true,
        message: 'Entity deleted successfully',
      });
    } catch (error: any) {
      if (error.statusCode === 404) {
        return res.status(404).json({ error: 'Entity not found' });
      }
      console.error('Entity delete error:', error);
      return res.status(500).json({ error: error.message || 'Failed to delete entity' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
