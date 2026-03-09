import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import RefreshIcon from "@mui/icons-material/Refresh";

interface Transaction {
  id: string;
  date: string;
  type: string;
  description: string;
  amount: number;
  status: string;
}

export function Transactions() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "payments" | "credits" | "purchases">("all");

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const uid = localStorage.getItem("uid");
      
      // Replace this URL with your actual Azure API endpoint
      const apiUrl = "YOUR_AZURE_API_ENDPOINT_HERE";
      
      const response = await fetch(`${apiUrl}/transactions/${uid}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // Add any authentication headers required by your Azure API
          // "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setTransactions(data);
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setError(err instanceof Error ? err.message : "Failed to load transactions");
      
      // Fallback to mock data for demonstration
      setTransactions([
        {
          id: "TXN-2024-001",
          date: "2024-03-05",
          type: "Payment",
          description: "LunaAI Premium Subscription",
          amount: -29.99,
          status: "Completed"
        },
        {
          id: "TXN-2024-002",
          date: "2024-03-01",
          type: "Credit",
          description: "Referral Bonus",
          amount: 10.00,
          status: "Completed"
        },
        {
          id: "TXN-2024-003",
          date: "2024-02-28",
          type: "Purchase",
          description: "API Credits - 1000 tokens",
          amount: -15.00,
          status: "Completed"
        },
        {
          id: "TXN-2024-004",
          date: "2024-02-20",
          type: "Payment",
          description: "LunaAI Enterprise Add-on",
          amount: -49.99,
          status: "Completed"
        },
        {
          id: "TXN-2024-005",
          date: "2024-02-15",
          type: "Credit",
          description: "Account Credit Adjustment",
          amount: 25.00,
          status: "Completed"
        },
        {
          id: "TXN-2024-006",
          date: "2024-02-10",
          type: "Purchase",
          description: "API Credits - 500 tokens",
          amount: -7.50,
          status: "Completed"
        },
        {
          id: "TXN-2024-007",
          date: "2024-02-05",
          type: "Payment",
          description: "LunaAI Premium Subscription",
          amount: -29.99,
          status: "Completed"
        },
        {
          id: "TXN-2024-008",
          date: "2024-01-28",
          type: "Purchase",
          description: "API Credits - 2000 tokens",
          amount: -25.00,
          status: "Completed"
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const getTransactionColor = (type: string) => {
    switch (type) {
      case "Credit":
        return "text-green-600";
      case "Payment":
      case "Purchase":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "text-green-600";
      case "Pending":
        return "text-yellow-600";
      case "Failed":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const filteredTransactions = transactions.filter((txn) => {
    if (filter === "all") return true;
    return txn.type.toLowerCase() === filter.slice(0, -1); // Remove 's' from filter
  });

  const totalBalance = transactions.reduce((sum, txn) => sum + txn.amount, 0);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/profile")}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowBackIcon />
            <span>Back to Profile</span>
          </button>
          <h2 className="text-3xl font-semibold">Transaction History</h2>
        </div>
        <button
          onClick={fetchTransactions}
          disabled={loading}
          className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
        >
          <RefreshIcon className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === "all"
              ? "bg-slate-900 text-white"
              : "bg-slate-200 text-slate-700 hover:bg-slate-300"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter("payments")}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === "payments"
              ? "bg-slate-900 text-white"
              : "bg-slate-200 text-slate-700 hover:bg-slate-300"
          }`}
        >
          Payments
        </button>
        <button
          onClick={() => setFilter("credits")}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === "credits"
              ? "bg-slate-900 text-white"
              : "bg-slate-200 text-slate-700 hover:bg-slate-300"
          }`}
        >
          Credits
        </button>
        <button
          onClick={() => setFilter("purchases")}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === "purchases"
              ? "bg-slate-900 text-white"
              : "bg-slate-200 text-slate-700 hover:bg-slate-300"
          }`}
        >
          Purchases
        </button>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-700 text-white p-6 rounded-lg mb-6 shadow-lg">
        <p className="text-sm opacity-80 mb-2">Current Balance</p>
        <p className="text-4xl font-bold">
          ${totalBalance.toFixed(2)}
        </p>
        <p className="text-sm opacity-80 mt-2">
          {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-slate-900 border-r-transparent"></div>
          <p className="mt-4 text-slate-600">Loading transactions...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
          <p className="font-semibold">Error loading transactions</p>
          <p className="text-sm mt-1">{error}</p>
          <p className="text-sm mt-2 text-slate-600">Showing sample data for demonstration.</p>
        </div>
      )}

      {/* Transactions Table */}
      {!loading && filteredTransactions.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-100 border-b">
              <tr>
                <th className="text-left px-6 py-4 font-semibold text-slate-700">Date</th>
                <th className="text-left px-6 py-4 font-semibold text-slate-700">Transaction ID</th>
                <th className="text-left px-6 py-4 font-semibold text-slate-700">Type</th>
                <th className="text-left px-6 py-4 font-semibold text-slate-700">Description</th>
                <th className="text-right px-6 py-4 font-semibold text-slate-700">Amount</th>
                <th className="text-center px-6 py-4 font-semibold text-slate-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((txn) => (
                <tr key={txn.id} className="border-b hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-slate-600">{txn.date}</td>
                  <td className="px-6 py-4 text-slate-500 text-sm font-mono">{txn.id}</td>
                  <td className="px-6 py-4">
                    <span className={`font-semibold ${getTransactionColor(txn.type)}`}>
                      {txn.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-700">{txn.description}</td>
                  <td className={`px-6 py-4 text-right font-bold ${getTransactionColor(txn.type)}`}>
                    {txn.amount > 0 ? "+" : ""}${txn.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(txn.status)}`}>
                      {txn.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredTransactions.length === 0 && (
        <div className="text-center py-12 bg-slate-50 rounded-lg">
          <p className="text-slate-600 text-lg">No transactions found</p>
          <p className="text-slate-500 text-sm mt-2">
            {filter !== "all" ? `Try changing the filter to see more transactions.` : ""}
          </p>
        </div>
      )}

      {/* API Configuration Note */}
      {error && (
        <div className="mt-6 bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-lg">
          <p className="font-semibold text-sm">Configure Your Azure API</p>
          <p className="text-xs mt-1">
            Update the <code className="bg-blue-100 px-1 rounded">apiUrl</code> variable in{" "}
            <code className="bg-blue-100 px-1 rounded">Transactions.tsx</code> with your Azure API endpoint.
          </p>
          <p className="text-xs mt-2">
            Expected endpoint format: <code className="bg-blue-100 px-1 rounded">https://your-api.azure.com/api</code>
          </p>
        </div>
      )}
    </div>
  );
}
