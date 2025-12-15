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
  const { project } = req.query;

  if (!project || typeof project !== 'string') {
    return res.status(400).json({ error: 'Missing project parameter' });
  }

  const tableClient = getTableClient();

  // GET - Get project settings
  if (req.method === 'GET') {
    try {
      try {
        const entity = await tableClient.getEntity(project, 'settings');
        return res.status(200).json({
          success: true,
          data: {
            partitionKey: entity.partitionKey,
            rowKey: entity.rowKey,
            entityType: 'settings',
            projectName: entity.projectName || project,
            defaultLayoutRowKey: entity.defaultLayoutRowKey || null,
            globalStyles: entity.globalStyles || '{}',
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
          },
        });
      } catch (error: any) {
        if (error.statusCode === 404) {
          // Return default settings if not found
          return res.status(200).json({
            success: true,
            data: {
              partitionKey: project,
              rowKey: 'settings',
              entityType: 'settings',
              projectName: project,
              defaultLayoutRowKey: null,
              globalStyles: '{}',
              createdAt: null,
              updatedAt: null,
            },
          });
        }
        throw error;
      }
    } catch (error: any) {
      console.error('Settings fetch error:', error);
      return res.status(500).json({ error: error.message || 'Failed to fetch settings' });
    }
  }

  // PUT - Update project settings
  if (req.method === 'PUT') {
    try {
      const data = req.body;
      const now = new Date().toISOString();

      // Try to get existing settings
      let existing: any = null;
      try {
        existing = await tableClient.getEntity(project, 'settings');
      } catch (error: any) {
        if (error.statusCode !== 404) throw error;
      }

      const entity = {
        partitionKey: project,
        rowKey: 'settings',
        entityType: 'settings',
        projectName: data.projectName || project,
        defaultLayoutRowKey: data.defaultLayoutRowKey !== undefined ? data.defaultLayoutRowKey : (existing?.defaultLayoutRowKey || ''),
        globalStyles: data.globalStyles !== undefined ? data.globalStyles : (existing?.globalStyles || '{}'),
        createdAt: existing?.createdAt || now,
        updatedAt: now,
      };

      await tableClient.upsertEntity(entity, 'Replace');

      return res.status(200).json({
        success: true,
        message: 'Settings saved successfully',
      });
    } catch (error: any) {
      console.error('Settings save error:', error);
      return res.status(500).json({ error: error.message || 'Failed to save settings' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
