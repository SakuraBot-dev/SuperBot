import { meta } from '../../core/bot/event';

export const stats = {
  connect: false,
  self_id: 0,
  update_at: 0
}

meta.on('connect', () => { stats.connect = true; })
meta.on('heartbeat', msg => {
  stats.self_id = msg.self_id;
  stats.update_at = msg.time;
});