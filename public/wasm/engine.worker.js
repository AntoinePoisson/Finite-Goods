let ready;

async function boot() {
  importScripts('./wasm_exec.js');
  const go = new Go();
  const response = await fetch('./engine.wasm');
  const source = await response.arrayBuffer();
  const { instance } = await WebAssembly.instantiate(source, go.importObject);
  go.run(instance);
}

self.addEventListener('message', async (event) => {
  const { id, payload } = event.data;
  try {
    ready ??= boot();
    await ready;
    const result = self.finiteGoodsApply(JSON.stringify(payload));
    self.postMessage({ id, result: JSON.parse(result) });
  } catch (error) {
    self.postMessage({ id, error: error instanceof Error ? error.message : 'Engine failed' });
  }
});
