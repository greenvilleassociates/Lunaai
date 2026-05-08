/**
 * Client-side SQL → JS filter translator.
 *
 * Takes an AI-generated SELECT statement and applies it as a filter/sort/limit
 * against a plain JSON array. Handles the patterns the VoiceSearch AI typically
 * produces (simple SELECT with WHERE, ORDER BY, TOP/LIMIT).
 *
 * Supported WHERE operators: =  !=  <>  >  <  >=  <=  LIKE  IN  IS NULL  IS NOT NULL
 * Supported combinators:  AND  (OR is passed through as "no filter" to avoid false drops)
 */

export interface SqlTranslation {
  columns: string[] | null;        // null = SELECT *
  filters: string[];               // human-readable description of each applied condition
  orderBy: string | null;
  orderDir: "ASC" | "DESC";
  limit: number | null;
  rowsIn: number;
  rowsOut: number;
}

// Case-insensitive field lookup on a row object
function getField(row: Record<string, unknown>, name: string): unknown {
  if (name in row) return row[name];
  const lower = name.toLowerCase();
  const key = Object.keys(row).find(k => k.toLowerCase() === lower);
  return key ? row[key] : undefined;
}

function parseValue(raw: string): string | number {
  const stripped = raw.replace(/^['"]|['"]$/g, "").trim();
  const n = Number(stripped);
  return isNaN(n) ? stripped : n;
}

function evaluateCondition(cond: string, row: Record<string, unknown>): boolean {
  cond = cond.trim();

  // IS NOT NULL
  const isNotNullM = cond.match(/^(\w+)\s+IS\s+NOT\s+NULL/i);
  if (isNotNullM) {
    const v = getField(row, isNotNullM[1]);
    return v != null && v !== "";
  }

  // IS NULL
  const isNullM = cond.match(/^(\w+)\s+IS\s+NULL/i);
  if (isNullM) {
    const v = getField(row, isNullM[1]);
    return v == null || v === "";
  }

  // NOT LIKE
  const notLikeM = cond.match(/^(\w+)\s+NOT\s+LIKE\s+'([^']*)'/i);
  if (notLikeM) {
    const fieldVal = String(getField(row, notLikeM[1]) ?? "").toLowerCase();
    const pattern = "^" + notLikeM[2].toLowerCase().replace(/%/g, ".*").replace(/_/g, ".") + "$";
    return !new RegExp(pattern).test(fieldVal);
  }

  // LIKE
  const likeM = cond.match(/^(\w+)\s+LIKE\s+'([^']*)'/i);
  if (likeM) {
    const fieldVal = String(getField(row, likeM[1]) ?? "").toLowerCase();
    const pattern = "^" + likeM[2].toLowerCase().replace(/%/g, ".*").replace(/_/g, ".") + "$";
    return new RegExp(pattern).test(fieldVal);
  }

  // NOT IN
  const notInM = cond.match(/^(\w+)\s+NOT\s+IN\s*\(([^)]+)\)/i);
  if (notInM) {
    const vals = notInM[2].split(",").map(v => String(parseValue(v.trim())).toLowerCase());
    const fieldVal = String(getField(row, notInM[1]) ?? "").toLowerCase();
    return !vals.includes(fieldVal);
  }

  // IN
  const inM = cond.match(/^(\w+)\s+IN\s*\(([^)]+)\)/i);
  if (inM) {
    const vals = inM[2].split(",").map(v => String(parseValue(v.trim())).toLowerCase());
    const fieldVal = String(getField(row, inM[1]) ?? "").toLowerCase();
    return vals.includes(fieldVal);
  }

  // Standard comparison:  >=  <=  !=  <>  >  <  =
  const compM = cond.match(/^(\w+)\s*(>=|<=|!=|<>|>|<|=)\s*(.+)$/);
  if (compM) {
    const [, field, op, rawVal] = compM;
    const parsed = parseValue(rawVal.trim());
    const rowRaw = getField(row, field);

    if (typeof parsed === "number" && typeof rowRaw === "number") {
      switch (op) {
        case "=":  return rowRaw === parsed;
        case "!=": case "<>": return rowRaw !== parsed;
        case ">":  return rowRaw >  parsed;
        case "<":  return rowRaw <  parsed;
        case ">=": return rowRaw >= parsed;
        case "<=": return rowRaw <= parsed;
      }
    }

    // String comparison (case-insensitive)
    const sv = String(rowRaw ?? "").toLowerCase();
    const rv = String(parsed).toLowerCase();
    switch (op) {
      case "=":  return sv === rv;
      case "!=": case "<>": return sv !== rv;
      case ">":  return sv >  rv;
      case "<":  return sv <  rv;
      case ">=": return sv >= rv;
      case "<=": return sv <= rv;
    }
  }

  // Unparseable condition — don't drop the row
  return true;
}

function evaluateWhere(clause: string, row: Record<string, unknown>): boolean {
  // Strip outer parentheses
  const stripped = clause.replace(/^\((.+)\)$/, "$1").trim();

  // Split on top-level AND (ignore OR — treat as pass-through to avoid false negatives)
  const parts = stripped.split(/\s+AND\s+/i);
  return parts.every(p => evaluateCondition(p.trim(), row));
}

export function applySqlToData(
  sql: string,
  data: Record<string, unknown>[]
): { rows: Record<string, unknown>[]; translation: SqlTranslation } {
  let result = [...data];
  const translation: SqlTranslation = {
    columns: null,
    filters: [],
    orderBy: null,
    orderDir: "ASC",
    limit: null,
    rowsIn: data.length,
    rowsOut: 0,
  };

  // TOP N
  const topM = sql.match(/SELECT\s+TOP\s+(\d+)/i);
  if (topM) translation.limit = parseInt(topM[1]);

  // SELECT columns (after optional TOP N, before FROM)
  const selM = sql.match(/SELECT\s+(?:TOP\s+\d+\s+)?(.+?)\s+FROM\s/i);
  if (selM) {
    const raw = selM[1].trim();
    if (raw !== "*") {
      translation.columns = raw
        .split(",")
        .map(c => c.trim().replace(/\[|\]|`/g, "").split(/\s+AS\s+/i)[0].trim());
    }
  }

  // WHERE
  const whereM = sql.match(/WHERE\s+(.+?)(?:\s+(?:GROUP\s+BY|ORDER\s+BY|LIMIT\s|HAVING\s)|;?\s*$)/i);
  if (whereM) {
    const clause = whereM[1].trim();
    result = result.filter(row => evaluateWhere(clause, row));

    // Describe applied filters
    clause.split(/\s+AND\s+/i).forEach(c => {
      translation.filters.push(c.trim());
    });
  }

  // ORDER BY
  const orderM = sql.match(/ORDER\s+BY\s+(\w+)(?:\s+(ASC|DESC))?/i);
  if (orderM) {
    translation.orderBy = orderM[1];
    translation.orderDir = ((orderM[2] ?? "ASC").toUpperCase()) as "ASC" | "DESC";
    const col = translation.orderBy;
    const dir = translation.orderDir;
    result.sort((a, b) => {
      const av = getField(a, col) ?? 0;
      const bv = getField(b, col) ?? 0;
      if (av < bv) return dir === "ASC" ? -1 : 1;
      if (av > bv) return dir === "ASC" ? 1 : -1;
      return 0;
    });
  }

  // LIMIT (MySQL-style, as fallback)
  const limitM = sql.match(/LIMIT\s+(\d+)/i);
  if (limitM && !translation.limit) translation.limit = parseInt(limitM[1]);

  // Apply TOP / LIMIT
  if (translation.limit !== null) result = result.slice(0, translation.limit);

  // Project columns
  if (translation.columns) {
    const cols = translation.columns;
    result = result.map(row => {
      const out: Record<string, unknown> = {};
      cols.forEach(c => { out[c] = getField(row, c); });
      return out;
    });
  }

  translation.rowsOut = result.length;
  return { rows: result, translation };
}
