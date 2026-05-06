import type express from 'express';
import { randomUUID } from 'crypto';
import { store } from '../store';
import { API_PREFIX, createJsonRoute, requireAuth, requireRole } from '../http';

export const registerResourcesModule = (app: express.Express) => {
  app.get(`${API_PREFIX}/resources`, createJsonRoute((req, res) => {
    const auth = requireAuth(req, res);
    if (!auth) return;

    res.json({ resources: store.getSnapshot().app.resources });
  }));

  app.post(`${API_PREFIX}/resources`, createJsonRoute((req, res) => {
    const auth = requireAuth(req, res);
    if (!auth || !requireRole(auth, ['teacher', 'admin'])) {
      res.status(403).json({ error: 'Only teachers and admins can add resources.' });
      return;
    }

    const { classId, name, type, size, preview } = req.body as { classId?: string; name?: string; type?: any; size?: string; preview?: string };
    if (!classId || !name || !type || !size || !preview) {
      res.status(400).json({ error: 'Missing resource fields.' });
      return;
    }

    const resource = {
      id: `resource-${randomUUID()}`,
      classId,
      name,
      type,
      size,
      preview,
      updatedAt: 'Just now',
    } as any;

    store.update((draft) => {
      draft.app.resources = [resource, ...draft.app.resources];
    });

    res.status(201).json({ resource });
  }));
};
