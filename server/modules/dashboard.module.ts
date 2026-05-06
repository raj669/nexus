import type express from 'express';
import { randomUUID } from 'crypto';
import { analyticsByRole, createInitialState } from '../../src/lib/lmsData';
import type { AppState, Role } from '../../src/lib/types';
import { buildPlatformHealth, deriveNextBestAction } from '../learning';
import { store } from '../store';
import { toPublicSnapshot } from '../types';
import type { AuthContext } from '../types';
import {
  API_PREFIX,
  createJsonRoute,
  getCurrentSnapshot,
  requireAuth,
  requireRole,
} from '../http';

const sessionPayload = (token: string, userId: string, role: Role) => ({ token, userId, role });

const dashboardStatePayload = (auth: AuthContext, snapshot = getCurrentSnapshot()) => ({
  ...toPublicSnapshot(snapshot),
  session: sessionPayload(auth.token, auth.user.id, auth.role),
});

export const registerDashboardModule = (app: express.Express) => {
  app.get(`${API_PREFIX}/state`, createJsonRoute((req, res) => {
    const auth = requireAuth(req, res);
    if (!auth) {
      return;
    }

    res.json(dashboardStatePayload(auth));
  }));

  app.put(`${API_PREFIX}/state`, createJsonRoute((req, res) => {
    const auth = requireAuth(req, res);
    if (!auth) {
      return;
    }

    const { app: nextApp } = req.body as { app?: AppState };
    if (!nextApp) {
      res.status(400).json({ error: 'Missing app payload.' });
      return;
    }

    store.replaceApp({
      ...nextApp,
      session: null,
    });

    res.json({ ok: true, state: store.getPublicSnapshot() });
  }));

  app.put(`${API_PREFIX}/preferences/widget-order`, createJsonRoute((req, res) => {
    const auth = requireAuth(req, res);
    if (!auth) {
      return;
    }

    const { widgetOrder } = req.body as { widgetOrder?: string[] };
    if (!widgetOrder?.length) {
      res.status(400).json({ error: 'Widget order is required.' });
      return;
    }

    store.update((draft) => {
      draft.app.preferences.widgetOrder = widgetOrder;
    });

    res.json({ ok: true, state: dashboardStatePayload(auth) });
  }));

  app.get(`${API_PREFIX}/analytics/overview`, createJsonRoute((req, res) => {
    const auth = requireAuth(req, res);
    if (!auth) {
      return;
    }

    const role = (req.query.role as Role | undefined) ?? auth.role;
    const analytics = analyticsByRole[role] ?? analyticsByRole.student;
    const snapshot = getCurrentSnapshot();
    res.json({
      role,
      analytics,
      health: buildPlatformHealth(snapshot),
      nextBestAction: deriveNextBestAction(snapshot, auth.user.id),
    });
  }));

  app.get(`${API_PREFIX}/insights/next-best-action/:userId`, createJsonRoute((req, res) => {
    const auth = requireAuth(req, res);
    if (!auth) {
      return;
    }

    const { userId } = req.params;
    if (auth.user.id !== userId && auth.role !== 'admin') {
      res.status(403).json({ error: 'You can only view your own recommendations.' });
      return;
    }

    res.json({ recommendation: deriveNextBestAction(getCurrentSnapshot(), userId) });
  }));
};
