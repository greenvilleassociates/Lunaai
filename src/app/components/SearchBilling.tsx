import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import ReceiptIcon from "@mui/icons-material/Receipt";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import SearchIcon from "@mui/icons-material/Search";
import SettingsIcon from "@mui/icons-material/Settings";
import { useNavigate } from "react-router";
import { API_CONFIG, getApiUrl } from "../config/api";

const DEFAULT_RATE = 0.05;           // $0.05 per standard search
const DEFAULT_SUPERLUNA_RATE = 0.50; // $0.50 per SuperLuna chained search
const RATE_KEY = "searchPricingRate";
const SUPERLUNA_RATE_KEY = "searchPricingRateSuperluna";

function isSuperluna(record: WebsearchRecord): boolean {
  return !!(record.model?.toLowerCase().includes("superluna"));
}

interface WebsearchRecord {
  id: number;
  uid: string;
  question: string;
  response: string;
  timestamp: string;
  metadata?: string | null;
  expectedtokens: number;
  expectedcost: number;
  requestType?: number | null;
  model?: string | null;
}

function getRate(): number {
  const stored = localStorage.getItem(RATE_KEY);
  if (stored) { const n = parseFloat(stored); if (!isNaN(n) && n >= 0) return n; }
  return DEFAULT_RATE;
}

function getSuperlunaRate(): number {
  const stored = localStorage.getItem(SUPERLUNA_RATE_KEY);
  if (stored) { const n = parseFloat(stored); if (!isNaN(n) && n >= 0) return n; }
  return DEFAULT_SUPERLUNA_RATE;
}

function formatCurrency(amount: number) {
  return `$${amount.toFixed(4)}`;
}

function formatDate(ts: string) {
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return ts;
  }
}

export function SearchBilling() {
  const navigate = useNavigate();
  const uid = localStorage.getItem("uid") || "";
  const username = localStorage.getItem("username") || "User";

  const [records, setRecords] = useState<WebsearchRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rate, setRate] = useState<number>(getRate());
  const [superlunaRate, setSuperlunaRate] = useState<number>(getSuperlunaRate());
  const [billedIds, setBilledIds] = useState<Set<number>>(new Set());
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [invoiceNote, setInvoiceNote] = useState("");
  const [invoiceGenerated, setInvoiceGenerated] = useState(false);

  useEffect(() => {
    loadRecords();
  }, []);

  // Keep rates in sync if settings change in another tab
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === RATE_KEY && e.newValue) {
        const n = parseFloat(e.newValue);
        if (!isNaN(n)) setRate(n);
      }
      if (e.key === SUPERLUNA_RATE_KEY && e.newValue) {
        const n = parseFloat(e.newValue);
        if (!isNaN(n)) setSuperlunaRate(n);
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const loadRecords = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = getApiUrl(API_CONFIG.ENDPOINTS.WEB_SEARCH);
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${uid}`,
        },
      });
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data: WebsearchRecord[] = await response.json();
      const filtered = data
        .filter((r) => r.uid === uid)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setRecords(filtered);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load search records");
    } finally {
      setLoading(false);
    }
  };

  const recordRate = (r: WebsearchRecord) => isSuperluna(r) ? superlunaRate : rate;

  const unbilledRecords = records.filter((r) => !billedIds.has(r.id));
  const totalSearches = records.length;
  const unbilledCount = unbilledRecords.length;
  const totalRebill = unbilledRecords.reduce((sum, r) => sum + recordRate(r), 0);
  const totalBilled = records.filter((r) => billedIds.has(r.id)).reduce((sum, r) => sum + recordRate(r), 0);
  const grandTotal = records.reduce((sum, r) => sum + recordRate(r), 0);

  const handleMarkAllBilled = () => {
    setBilledIds(new Set(records.map((r) => r.id)));
    setInvoiceGenerated(false);
  };

  const handleGenerateInvoice = () => {
    setInvoiceNote("");
    setInvoiceGenerated(false);
    setInvoiceOpen(true);
  };

  const handleConfirmInvoice = () => {
    setBilledIds(new Set(records.map((r) => r.id)));
    setInvoiceGenerated(true);
    setInvoiceOpen(false);
  };

  return (
    <Box sx={{ maxWidth: 1100, mx: "auto", p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2, mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <ReceiptIcon sx={{ fontSize: 40, color: "#8B0000" }} />
          <Box>
            <Typography variant="h5" fontWeight={700}>Search Billing</Typography>
            <Typography variant="body2" color="text.secondary">
              AI search usage and rebilling for <strong>{username}</strong>
            </Typography>
          </Box>
        </Box>
        <Button
          variant="outlined"
          size="small"
          startIcon={<SettingsIcon />}
          onClick={() => navigate("/settings")}
          sx={{ borderColor: "#8B0000", color: "#8B0000", "&:hover": { borderColor: "#6B0000", backgroundColor: "rgba(139,0,0,0.04)" } }}
        >
          Search Pricing Settings
        </Button>
      </Box>

      {/* Summary Cards */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" }, gap: 2, mb: 3 }}>
        <Paper elevation={2} sx={{ p: 2.5, borderRadius: 2, borderTop: "3px solid #8B0000" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
            <SearchIcon sx={{ fontSize: 18, color: "#8B0000" }} />
            <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={0.5}>
              Total Searches
            </Typography>
          </Box>
          <Typography variant="h4" fontWeight={700}>{totalSearches}</Typography>
        </Paper>

        <Paper elevation={2} sx={{ p: 2.5, borderRadius: 2, borderTop: "3px solid #0062FF" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
            <AttachMoneyIcon sx={{ fontSize: 18, color: "#0062FF" }} />
            <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={0.5}>
              Rates
            </Typography>
          </Box>
          <Typography variant="body2" fontWeight={700}>{formatCurrency(rate)} <Typography component="span" variant="caption" color="text.secondary">standard</Typography></Typography>
          <Typography variant="body2" fontWeight={700} color="#7c3aed">{formatCurrency(superlunaRate)} <Typography component="span" variant="caption" color="text.secondary">SuperLuna</Typography></Typography>
        </Paper>

        <Paper elevation={2} sx={{ p: 2.5, borderRadius: 2, borderTop: "3px solid #f59e0b" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
            <ReceiptIcon sx={{ fontSize: 18, color: "#f59e0b" }} />
            <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={0.5}>
              Unbilled ({unbilledCount})
            </Typography>
          </Box>
          <Typography variant="h4" fontWeight={700} color="#f59e0b">{formatCurrency(totalRebill)}</Typography>
        </Paper>

        <Paper elevation={2} sx={{ p: 2.5, borderRadius: 2, borderTop: "3px solid #16a34a" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
            <AttachMoneyIcon sx={{ fontSize: 18, color: "#16a34a" }} />
            <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={0.5}>
              Billed ({billedIds.size})
            </Typography>
          </Box>
          <Typography variant="h4" fontWeight={700} color="#16a34a">{formatCurrency(totalBilled)}</Typography>
        </Paper>
      </Box>

      {/* Actions */}
      {records.length > 0 && unbilledCount > 0 && (
        <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
          <Button
            variant="contained"
            startIcon={<ReceiptIcon />}
            onClick={handleGenerateInvoice}
            sx={{ backgroundColor: "#8B0000", "&:hover": { backgroundColor: "#6B0000" } }}
          >
            Generate Invoice ({unbilledCount} search{unbilledCount !== 1 ? "es" : ""} — {formatCurrency(totalRebill)})
          </Button>
          <Button
            variant="outlined"
            onClick={handleMarkAllBilled}
            sx={{ borderColor: "#16a34a", color: "#16a34a", "&:hover": { borderColor: "#15803d", backgroundColor: "rgba(22,163,74,0.04)" } }}
          >
            Mark All as Billed
          </Button>
        </Box>
      )}

      {invoiceGenerated && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setInvoiceGenerated(false)}>
          Invoice generated for {billedIds.size} search(es) — Total: {formatCurrency(billedIds.size * rate)}. All records marked as billed.
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Table */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress sx={{ color: "#8B0000" }} />
        </Box>
      ) : records.length === 0 ? (
        <Paper elevation={0} sx={{ p: 5, textAlign: "center", border: "2px dashed #e2e8f0", borderRadius: 2 }}>
          <SearchIcon sx={{ fontSize: 52, color: "#94a3b8", mb: 1 }} />
          <Typography color="text.secondary">No search records found for this account.</Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f8fafc" }}>
                <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: 0.5 }}>#</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: 0.5 }}>Question</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: 0.5 }}>Timestamp</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: 0.5 }}>Model</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: 0.5 }}>Tokens</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: 0.5 }}>AI Cost</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: 0.5 }}>Rebill</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: 0.5 }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {records.map((record, idx) => {
                const isBilled = billedIds.has(record.id);
                return (
                  <TableRow
                    key={record.id}
                    sx={{
                      backgroundColor: isBilled ? "#f0fdf4" : "inherit",
                      "&:hover": { backgroundColor: isBilled ? "#dcfce7" : "#f8fafc" },
                    }}
                  >
                    <TableCell sx={{ color: "#94a3b8", fontSize: "0.75rem" }}>{idx + 1}</TableCell>
                    <TableCell
                      sx={{
                        maxWidth: 320,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        fontSize: "0.8rem",
                      }}
                      title={record.question}
                    >
                      {record.question}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: "nowrap", fontSize: "0.75rem", color: "#64748b" }}>
                      {formatDate(record.timestamp)}
                    </TableCell>
                    <TableCell>
                      {record.model ? (
                        <Chip label={record.model} size="small" sx={{ fontSize: "0.65rem", height: 20 }} />
                      ) : (
                        <Typography variant="caption" color="text.secondary">—</Typography>
                      )}
                    </TableCell>
                    <TableCell align="right" sx={{ fontSize: "0.8rem", fontFamily: "monospace" }}>
                      {record.expectedtokens > 0 ? record.expectedtokens.toLocaleString() : "—"}
                    </TableCell>
                    <TableCell align="right" sx={{ fontSize: "0.8rem", fontFamily: "monospace", color: "#64748b" }}>
                      {record.expectedcost > 0 ? formatCurrency(record.expectedcost) : "—"}
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="caption" fontFamily="monospace" fontWeight={700} color={isBilled ? "#16a34a" : "#f59e0b"}>
                        {formatCurrency(recordRate(record))}
                      </Typography>
                      {isSuperluna(record) && (
                        <Chip label="SL" size="small" sx={{ ml: 0.5, height: 16, fontSize: "0.6rem", backgroundColor: "#ede9fe", color: "#7c3aed", fontWeight: 700 }} />
                      )}
                    </TableCell>
                    <TableCell align="center">
                      {isBilled ? (
                        <Chip
                          label="Billed"
                          size="small"
                          sx={{ backgroundColor: "#dcfce7", color: "#15803d", fontSize: "0.65rem", height: 20, fontWeight: 600 }}
                        />
                      ) : (
                        <Chip
                          label="Unbilled"
                          size="small"
                          sx={{ backgroundColor: "#fef3c7", color: "#b45309", fontSize: "0.65rem", height: 20 }}
                          onClick={() => setBilledIds((prev) => new Set([...prev, record.id]))}
                        />
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {/* Footer Totals */}
          <Box sx={{ p: 2, borderTop: "1px solid #e2e8f0", backgroundColor: "#f8fafc", display: "flex", justifyContent: "flex-end", gap: 4, flexWrap: "wrap" }}>
            <Box sx={{ textAlign: "right" }}>
              <Typography variant="caption" color="text.secondary" display="block">Unbilled Rebill Total</Typography>
              <Typography variant="subtitle1" fontWeight={700} color="#f59e0b">{formatCurrency(totalRebill)}</Typography>
            </Box>
            <Divider orientation="vertical" flexItem />
            <Box sx={{ textAlign: "right" }}>
              <Typography variant="caption" color="text.secondary" display="block">Total Billed</Typography>
              <Typography variant="subtitle1" fontWeight={700} color="#16a34a">{formatCurrency(totalBilled)}</Typography>
            </Box>
            <Divider orientation="vertical" flexItem />
            <Box sx={{ textAlign: "right" }}>
              <Typography variant="caption" color="text.secondary" display="block">Grand Total</Typography>
              <Typography variant="subtitle1" fontWeight={700}>{formatCurrency(grandTotal)}</Typography>
            </Box>
          </Box>
        </TableContainer>
      )}

      {/* Invoice Dialog */}
      <Dialog open={invoiceOpen} onClose={() => setInvoiceOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ backgroundColor: "#8B0000", color: "white", fontWeight: 700 }}>
          Generate Rebill Invoice
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ mb: 3, p: 2, backgroundColor: "#f8fafc", borderRadius: 1, border: "1px solid #e2e8f0" }}>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>Invoice Summary</Typography>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
              <Typography variant="body2" color="text.secondary">User:</Typography>
              <Typography variant="body2" fontWeight={600}>{username}</Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
              <Typography variant="body2" color="text.secondary">Unbilled searches:</Typography>
              <Typography variant="body2" fontWeight={600}>{unbilledCount}</Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
              <Typography variant="body2" color="text.secondary">Standard rate:</Typography>
              <Typography variant="body2" fontWeight={600}>{formatCurrency(rate)}</Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
              <Typography variant="body2" color="text.secondary">SuperLuna rate:</Typography>
              <Typography variant="body2" fontWeight={600} color="#7c3aed">{formatCurrency(superlunaRate)}</Typography>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="body1" fontWeight={700}>Total to Bill:</Typography>
              <Typography variant="body1" fontWeight={700} color="#8B0000">{formatCurrency(totalRebill)}</Typography>
            </Box>
          </Box>
          <TextField
            label="Invoice Notes (optional)"
            multiline
            rows={3}
            fullWidth
            value={invoiceNote}
            onChange={(e) => setInvoiceNote(e.target.value)}
            placeholder="Add billing notes or reference number..."
            variant="outlined"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setInvoiceOpen(false)} sx={{ color: "#64748b" }}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleConfirmInvoice}
            sx={{ backgroundColor: "#8B0000", "&:hover": { backgroundColor: "#6B0000" } }}
          >
            Confirm &amp; Mark as Billed
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
