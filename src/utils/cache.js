import NodeCache from "node-cache";

// Small in-memory cache for hot callers
const cache = new NodeCache({
  stdTTL: 600,
  checkperiod: 120,
  useClones: false,
  maxKeys: 500,
});

export default cache;
