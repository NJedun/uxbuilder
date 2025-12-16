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
    return res.status(400).json({ error: 'Project name is required' });
  }

  // DELETE - Delete all entities in a project
  if (req.method === 'DELETE') {
    try {
      const tableClient = getTableClient();

      // Get all entities with this partitionKey
      const queryResults = tableClient.listEntities({
        queryOptions: { filter: `PartitionKey eq '${project}'` },
      });

      const entitiesToDelete: { partitionKey: string; rowKey: string }[] = [];
      for await (const entity of queryResults) {
        entitiesToDelete.push({
          partitionKey: entity.partitionKey as string,
          rowKey: entity.rowKey as string,
        });
      }

      if (entitiesToDelete.length === 0) {
        return res.status(404).json({ error: 'Project not found or already empty' });
      }

      // Delete all entities
      let deletedCount = 0;
      for (const entity of entitiesToDelete) {
        try {
          await tableClient.deleteEntity(entity.partitionKey, entity.rowKey);
          deletedCount++;
        } catch (error: any) {
          console.error(`Failed to delete entity ${entity.rowKey}:`, error);
        }
      }

      return res.status(200).json({
        success: true,
        message: `Project "${project}" deleted successfully`,
        deletedCount,
        totalEntities: entitiesToDelete.length,
      });
    } catch (error: any) {
      console.error('Project delete error:', error);
      return res.status(500).json({ error: error.message || 'Failed to delete project' });
    }
  }

  // GET - Get project details (count of entities)
  if (req.method === 'GET') {
    try {
      const tableClient = getTableClient();

      const queryResults = tableClient.listEntities({
        queryOptions: { filter: `PartitionKey eq '${project}'` },
      });

      let pageCount = 0;
      let layoutCount = 0;

      for await (const entity of queryResults) {
        const entityType = entity.entityType as string;
        if (entityType === 'layout') {
          layoutCount++;
        } else {
          pageCount++;
        }
      }

      return res.status(200).json({
        success: true,
        project,
        pageCount,
        layoutCount,
        totalCount: pageCount + layoutCount,
      });
    } catch (error: any) {
      console.error('Project fetch error:', error);
      return res.status(500).json({ error: error.message || 'Failed to fetch project details' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
