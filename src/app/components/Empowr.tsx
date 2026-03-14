import { useState } from "react";
import { Box, Typography, TextField, Button, Paper, Card, CardContent, Chip, Alert } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import BusinessIcon from "@mui/icons-material/Business";
import InsightsIcon from "@mui/icons-material/Insights";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { Psychology } from "@mui/icons-material";

export function Empowr() {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setSearching(true);
    
    // Simulate search delay
    setTimeout(() => {
      // Mock results for demonstration
      setResults([
        {
          id: 1,
          title: "Q4 Sales Performance Analysis",
          category: "Analytics",
          description: "Comprehensive analysis of Q4 sales data showing 23% growth in enterprise segment.",
          relevance: 95,
          source: "Enterprise Dashboard",
        },
        {
          id: 2,
          title: "Customer Acquisition Trends 2025",
          category: "Marketing",
          description: "Detailed breakdown of customer acquisition channels and conversion rates.",
          relevance: 88,
          source: "Marketing Analytics",
        },
        {
          id: 3,
          title: "Regional Performance Metrics",
          category: "Operations",
          description: "Regional comparison of key performance indicators across all territories.",
          relevance: 82,
          source: "Operations Portal",
        },
      ]);
      setSearching(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <Box className="mb-6">
        <Box className="flex items-center gap-3 mb-2">
          <SearchIcon sx={{ fontSize: 40, color: "#8B0000" }} />
          <Typography variant="h4">
            Empowr for Enterprise Queries
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary" className="mb-4">
          Intelligent enterprise search powered by AI to find insights across your organization
        </Typography>

        <Alert severity="info" className="mb-4">
          <strong>Powered by ChatGPT:</strong> Ask questions in natural language to discover insights from your enterprise data.
        </Alert>
      </Box>

      {/* Search Box */}
      <Paper className="p-6 mb-6">
        <Box className="flex items-center gap-3 mb-4">
          <Psychology className="text-slate-700" fontSize="large" />
          <Typography variant="h6">Ask a Question</Typography>
        </Box>

        <Box className="flex gap-3">
          <TextField
            fullWidth
            variant="outlined"
            placeholder="E.g., What were the top performing products last quarter?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            sx={{
              "& .MuiOutlinedInput-root": {
                "&:hover fieldset": {
                  borderColor: "#8B0000",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#8B0000",
                },
              },
            }}
          />
          <Button
            variant="contained"
            onClick={handleSearch}
            disabled={searching || !query.trim()}
            startIcon={<SearchIcon />}
            sx={{
              backgroundColor: "#8B0000",
              minWidth: "120px",
              "&:hover": {
                backgroundColor: "#6B0000",
              },
              "&.Mui-disabled": {
                backgroundColor: "#ccc",
              },
            }}
          >
            {searching ? "Searching..." : "Search"}
          </Button>
        </Box>

        {/* Example Queries */}
        <Box className="mt-4">
          <Typography variant="body2" color="text.secondary" className="mb-2">
            Try asking:
          </Typography>
          <Box className="flex flex-wrap gap-2">
            <Chip
              label="Show me sales trends this quarter"
              size="small"
              onClick={() => setQuery("Show me sales trends this quarter")}
              sx={{ cursor: "pointer", "&:hover": { backgroundColor: "#f0f0f0" } }}
            />
            <Chip
              label="What are our top customers?"
              size="small"
              onClick={() => setQuery("What are our top customers?")}
              sx={{ cursor: "pointer", "&:hover": { backgroundColor: "#f0f0f0" } }}
            />
            <Chip
              label="Compare regional performance"
              size="small"
              onClick={() => setQuery("Compare regional performance")}
              sx={{ cursor: "pointer", "&:hover": { backgroundColor: "#f0f0f0" } }}
            />
          </Box>
        </Box>
      </Paper>

      {/* Search Results */}
      {results.length > 0 && (
        <Box>
          <Typography variant="h5" className="mb-4">
            Search Results ({results.length})
          </Typography>

          <Box className="space-y-4">
            {results.map((result) => (
              <Card key={result.id} className="hover:shadow-lg transition-shadow">
                <CardContent>
                  <Box className="flex items-start justify-between mb-2">
                    <Box className="flex-1">
                      <Typography variant="h6" className="mb-1">
                        {result.title}
                      </Typography>
                      <Box className="flex items-center gap-2 mb-2">
                        <Chip
                          label={result.category}
                          size="small"
                          icon={
                            result.category === "Analytics" ? (
                              <InsightsIcon />
                            ) : result.category === "Marketing" ? (
                              <TrendingUpIcon />
                            ) : (
                              <BusinessIcon />
                            )
                          }
                          sx={{ backgroundColor: "#f0f0f0" }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          From: {result.source}
                        </Typography>
                      </Box>
                    </Box>
                    <Chip
                      label={`${result.relevance}% Match`}
                      size="small"
                      sx={{
                        backgroundColor: "#8B0000",
                        color: "white",
                        fontWeight: "bold",
                      }}
                    />
                  </Box>

                  <Typography variant="body2" color="text.secondary">
                    {result.description}
                  </Typography>

                  <Box className="mt-3">
                    <Button
                      size="small"
                      sx={{
                        color: "#8B0000",
                        "&:hover": {
                          backgroundColor: "rgba(139, 0, 0, 0.04)",
                        },
                      }}
                    >
                      View Details
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>
      )}

      {/* Empty State */}
      {results.length === 0 && !searching && (
        <Paper className="p-8 text-center">
          <SearchIcon sx={{ fontSize: 64, color: "#ccc", mb: 2 }} />
          <Typography variant="h6" color="text.secondary" className="mb-2">
            Start Your Enterprise Search
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Use the search box above to query your enterprise data with natural language.
            <br />
            Empowr uses AI to understand your questions and find relevant insights.
          </Typography>
        </Paper>
      )}

      {/* Features Section */}
      <Box className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent>
            <Box className="flex items-center gap-2 mb-2">
              <Psychology sx={{ color: "#8B0000" }} />
              <Typography variant="h6" fontSize="1rem">
                AI-Powered
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Leverages ChatGPT to understand natural language queries and deliver intelligent results.
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box className="flex items-center gap-2 mb-2">
              <InsightsIcon sx={{ color: "#8B0000" }} />
              <Typography variant="h6" fontSize="1rem">
                Deep Insights
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Search across all enterprise data sources to discover hidden patterns and insights.
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box className="flex items-center gap-2 mb-2">
              <BusinessIcon sx={{ color: "#8B0000" }} />
              <Typography variant="h6" fontSize="1rem">
                Enterprise-Wide
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Access information from sales, marketing, operations, and all other departments.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </div>
  );
}
