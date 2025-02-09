
import { WebSocketServer } from 'ws';
import { server } from './index';

const wss = new WebSocketServer({ server });

const clients = new Map();

wss.on('connection', (ws, req) => {
  const userId = req.session?.user?.id;
  if (userId) {
    clients.set(userId, ws);
  }

  ws.on('close', () => {
    clients.delete(userId);
  });
});

export function notifyUser(userId: number, data: any) {
  const client = clients.get(userId);
  if (client) {
    client.send(JSON.stringify(data));
  }
}
