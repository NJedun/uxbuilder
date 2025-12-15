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
  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const tableClient = getPagesTableClient();
    const slug = req.query.slug;

    if (!slug || typeof slug !== 'string') {
      return res.status(400).json({ error: 'Missing slug parameter' });
    }

    const queryResults = tableClient.listEntities({
      queryOptions: { filter: `slug eq '${slug}'` },
    });

    let foundEntity: any = null;
    for await (const entity of queryResults) {
      foundEntity = entity;
      break;
    }

    if (!foundEntity) {
      return res.status(404).json({ error: 'Page not found' });
    }

    return res.status(200).json({
      success: true,
      data: {
        rowKey: foundEntity.rowKey,
        partitionKey: foundEntity.partitionKey,
        pageType: foundEntity.pageType,
        slug: foundEntity.slug,
        parentRowKey: foundEntity.parentRowKey || null,
        layoutRowKey: foundEntity.layoutRowKey || null,
        title: foundEntity.title,
        name: foundEntity.name || foundEntity.title,
        summary: foundEntity.summary || '',
        category: foundEntity.category || null,
        components: foundEntity.components,
        sectionComponents: foundEntity.sectionComponents || '{}',
        globalStyles: foundEntity.globalStyles,
        // Layout-specific fields
        headerComponents: foundEntity.headerComponents || '',
        footerComponents: foundEntity.footerComponents || '',
        bodySections: foundEntity.bodySections || '[]',
        headerStyles: foundEntity.headerStyles || '',
        bodyStyles: foundEntity.bodyStyles || '',
        footerStyles: foundEntity.footerStyles || '',
        isDefault: foundEntity.isDefault || false,
        isPublished: foundEntity.isPublished || false,
        createdAt: foundEntity.createdAt,
        updatedAt: foundEntity.updatedAt,
      },
    });
  } catch (error: any) {
    console.error('Page by slug fetch error:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch page' });
  }
}
