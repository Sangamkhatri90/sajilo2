const sql = require("msnodesqlv8");

// Some report/search queries legitimately take longer than 30 seconds on a
// large company database.  The value can still be overridden per deployment.
const DEFAULT_QUERY_TIMEOUT_MS = Number(process.env.SQL_QUERY_TIMEOUT_MS || 60000);
const QUERY_LEAK_WARNING_MS = Number(process.env.SQL_QUERY_LEAK_WARNING_MS || 60000);
const MAX_POOL_SIZE = Number(process.env.SQL_POOL_SIZE || 5);

const pools = new Map();

function getPool(connectionString) {
  if (!pools.has(connectionString)) {
    pools.set(connectionString, {
      connectionString,
      idle: [],
      total: 0,
      queue: [],
      inFlight: new Map(),
      nextQueryId: 1,
    });
  }

  return pools.get(connectionString);
}

function openConnection(pool, callback) {
  pool.total += 1;

  sql.open(pool.connectionString, (err, connection) => {
    if (err) {
      pool.total -= 1;
      return callback(err);
    }

    callback(null, connection);
  });
}

function acquire(pool, callback) {
  const idleConnection = pool.idle.pop();
  if (idleConnection) return callback(null, idleConnection);

  if (pool.total < MAX_POOL_SIZE) {
    return openConnection(pool, callback);
  }

  pool.queue.push(callback);
}

function release(pool, connection) {
  const next = pool.queue.shift();
  if (next) return next(null, connection);

  pool.idle.push(connection);
}

function discard(pool, connection) {
  pool.total = Math.max(0, pool.total - 1);

  try {
    connection.close();
  } catch (closeErr) {
    console.warn("SQL pooled connection close failed:", closeErr.message);
  }

  const next = pool.queue.shift();
  if (next) acquire(pool, next);
}

function normalizeArgs(connectionString, queryText, params, callback) {
  if (typeof params === "function") {
    return { connectionString, queryText, params: [], callback: params };
  }

  return { connectionString, queryText, params: params || [], callback };
}

function executeQuery(connectionString, queryText, params, callback) {
  const args = normalizeArgs(connectionString, queryText, params, callback);
  const pool = getPool(args.connectionString);
  const queryId = pool.nextQueryId++;
  const startedAt = Date.now();

  acquire(pool, (acquireErr, connection) => {
    if (acquireErr) return args.callback(acquireErr);

    let finished = false;

    // Performance: pooled ODBC connections avoid repeated SQL login handshakes while
    // preserving session-selected database connection strings and existing callbacks.
    pool.inFlight.set(queryId, {
      queryText: args.queryText,
      startedAt,
    });

    const timeout = setTimeout(() => {
      if (finished) return;
      finished = true;
      pool.inFlight.delete(queryId);
      discard(pool, connection);
      const err = new Error(`SQL query timed out after ${DEFAULT_QUERY_TIMEOUT_MS}ms`);
      err.code = "ETIMEOUT";
      args.callback(err);
    }, DEFAULT_QUERY_TIMEOUT_MS);

    connection.query(args.queryText, args.params, (queryErr, rows) => {
      if (finished) return;
      finished = true;
      clearTimeout(timeout);
      pool.inFlight.delete(queryId);

      if (queryErr) {
        discard(pool, connection);
        return args.callback(queryErr);
      }

      release(pool, connection);
      args.callback(null, rows);
    });
  });
}

setInterval(() => {
  const now = Date.now();

  for (const pool of pools.values()) {
    for (const [queryId, query] of pool.inFlight.entries()) {
      const elapsed = now - query.startedAt;
      if (elapsed > QUERY_LEAK_WARNING_MS) {
        console.warn(`Long running SQL query detected (${elapsed}ms, id=${queryId})`);
      }
    }
  }
}, Math.min(QUERY_LEAK_WARNING_MS, 30000)).unref();

process.once("exit", () => {
  for (const pool of pools.values()) {
    for (const connection of pool.idle) {
      try {
        connection.close();
      } catch (_) {
        // Best effort close during process shutdown.
      }
    }
  }
});

module.exports = {
  ...sql,
  query: executeQuery,
  promises: {
    ...(sql.promises || {}),
    query(connectionString, queryText, params) {
      return new Promise((resolve, reject) => {
        executeQuery(connectionString, queryText, params || [], (err, rows) => {
          if (err) return reject(err);
          resolve(rows);
        });
      });
    },
  },
  getPoolStats() {
    return Array.from(pools.values()).map((pool) => ({
      total: pool.total,
      idle: pool.idle.length,
      queued: pool.queue.length,
      inFlight: pool.inFlight.size,
    }));
  },
};
