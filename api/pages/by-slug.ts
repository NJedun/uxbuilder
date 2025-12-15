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
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const tableClient = getTableClient();
    const slug = req.query.slug;

    if (!slug || typeof slug !== 'string') {
      return res.status(400).json({ error: 'Missing slug parameter' });
    }

    const queryResults = tableClient.listEntities({
      queryOptions: { filter: `slug eq '${slug}' and entityType eq 'page'` },
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
      data: formatEntityResponse(foundEntity),
    });
  } catch (error: any) {
    console.error('Page by slug fetch error:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch page' });
  }
}
