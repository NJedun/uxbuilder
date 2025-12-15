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
  const { project, rowKey } = req.query;

  if (!project || !rowKey || typeof project !== 'string' || typeof rowKey !== 'string') {
    return res.status(400).json({ error: 'Missing project or rowKey' });
  }

  const tableClient = getPagesTableClient();

  // GET - Get single page
  if (req.method === 'GET') {
    try {
      const entity = await tableClient.getEntity(project, rowKey);

      return res.status(200).json({
        success: true,
        data: {
          rowKey: entity.rowKey,
          partitionKey: entity.partitionKey,
          pageType: entity.pageType,
          slug: entity.slug,
          parentRowKey: entity.parentRowKey || null,
          layoutRowKey: entity.layoutRowKey || null,
          title: entity.title,
          name: entity.name || entity.title,
          summary: entity.summary || '',
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
        },
      });
    } catch (error: any) {
      if (error.statusCode === 404) {
        return res.status(404).json({ error: 'Page not found' });
      }
      console.error('Page fetch error:', error);
      return res.status(500).json({ error: error.message || 'Failed to fetch page' });
    }
  }

  // PUT - Update existing page
  if (req.method === 'PUT') {
    try {
      const pageData = req.body;

      // Get existing entity first
      const existing = await tableClient.getEntity(project, rowKey);

      const entity = {
        partitionKey: project,
        rowKey: rowKey,
        pageType: pageData.pageType || existing.pageType,
        slug: pageData.slug || existing.slug,
        parentRowKey: pageData.parentRowKey !== undefined ? pageData.parentRowKey : existing.parentRowKey,
        layoutRowKey: pageData.layoutRowKey !== undefined ? pageData.layoutRowKey : existing.layoutRowKey,
        title: pageData.title || existing.title,
        name: pageData.name !== undefined ? pageData.name : existing.name,
        summary: pageData.summary !== undefined ? pageData.summary : existing.summary,
        category: pageData.category !== undefined ? pageData.category : existing.category,
        components: pageData.components !== undefined ? pageData.components : existing.components,
        sectionComponents: pageData.sectionComponents !== undefined ? pageData.sectionComponents : existing.sectionComponents,
        globalStyles: pageData.globalStyles || existing.globalStyles,
        // Layout-specific fields
        headerComponents: pageData.headerComponents !== undefined ? pageData.headerComponents : existing.headerComponents,
        footerComponents: pageData.footerComponents !== undefined ? pageData.footerComponents : existing.footerComponents,
        bodySections: pageData.bodySections !== undefined ? pageData.bodySections : existing.bodySections,
        headerStyles: pageData.headerStyles !== undefined ? pageData.headerStyles : existing.headerStyles,
        bodyStyles: pageData.bodyStyles !== undefined ? pageData.bodyStyles : existing.bodyStyles,
        footerStyles: pageData.footerStyles !== undefined ? pageData.footerStyles : existing.footerStyles,
        isDefault: pageData.isDefault !== undefined ? pageData.isDefault : existing.isDefault,
        isPublished: pageData.isPublished !== undefined ? pageData.isPublished : existing.isPublished,
        createdAt: existing.createdAt,
        updatedAt: new Date().toISOString(),
      };

      await tableClient.updateEntity(entity, 'Replace');

      return res.status(200).json({
        success: true,
        message: 'Page updated successfully',
      });
    } catch (error: any) {
      if (error.statusCode === 404) {
        return res.status(404).json({ error: 'Page not found' });
      }
      console.error('Page update error:', error);
      return res.status(500).json({ error: error.message || 'Failed to update page' });
    }
  }

  // DELETE - Delete page
  if (req.method === 'DELETE') {
    try {
      await tableClient.deleteEntity(project, rowKey);

      return res.status(200).json({
        success: true,
        message: 'Page deleted successfully',
      });
    } catch (error: any) {
      if (error.statusCode === 404) {
        return res.status(404).json({ error: 'Page not found' });
      }
      console.error('Page delete error:', error);
      return res.status(500).json({ error: error.message || 'Failed to delete page' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
