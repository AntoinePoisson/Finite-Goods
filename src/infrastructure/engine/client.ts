import type { Command, EngineResult, World } from '../../domain/types';

interface PendingRequest {
  resolve: (result: EngineResult) => void;
  reject: (error: Error) => void;
}

class EngineClient {
  private worker?: Worker;
  private readonly pending = new Map<string, PendingRequest>();

  apply(world: World, command: Command) {
    this.worker ??= this.createWorker();
    const id = crypto.randomUUID();

    return new Promise<EngineResult>((resolve, reject) => {
      // A single worker handles every command, so ids pair responses with their original promise.
      this.pending.set(id, { resolve, reject });
      this.worker?.postMessage({ id, payload: { world, command } });
    });
  }

  private createWorker() {
    const worker = new Worker(`${import.meta.env.BASE_URL}wasm/engine.worker.js`);
    worker.addEventListener('message', (event: MessageEvent) => {
      const request = this.pending.get(event.data.id as string);
      if (!request) return;

      this.pending.delete(event.data.id as string);
      if (event.data.error) request.reject(new Error(event.data.error as string));
      else request.resolve(event.data.result as EngineResult);
    });
    worker.addEventListener('error', () => {
      for (const request of this.pending.values())
        request.reject(new Error('The domain engine could not start.'));
      this.pending.clear();
    });
    return worker;
  }
}

export const engine = new EngineClient();
