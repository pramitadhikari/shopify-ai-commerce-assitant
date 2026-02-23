import { useState } from "react";
import axios from "axios";
import "./App.css";

const API = "http://localhost:8787";

export default function App() {
  const [shop, setShop] = useState("demo-shop");
  const [question, setQuestion] = useState("Suggest bundle offers based on recent orders.");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const ingestSample = async () => {
    setLoading(true);
    setResult(null);
    try {
      const r = await axios.post(`${API}/api/ingest/sample`, { shop });
      setResult({ type: "ingest", data: r.data });
    } catch (e) {
      setResult({ type: "error", data: e?.response?.data ?? String(e) });
    } finally {
      setLoading(false);
    }
  };

  const getRecommendations = async () => {
    setLoading(true);
    setResult(null);
    try {
      const r = await axios.post(`${API}/api/recommendations`, { shop, question });
      setResult({ type: "recs", data: r.data });
    } catch (e) {
      setResult({ type: "error", data: e?.response?.data ?? String(e) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: 20 }}>
      <h2>AI-Powered Commerce Assistant (Local)</h2>

      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <label>
          Shop:
          <input value={shop} onChange={(e) => setShop(e.target.value)} style={{ marginLeft: 8 }} />
        </label>

        <button onClick={ingestSample} disabled={loading}>
          Ingest Sample Orders
        </button>

        <button onClick={getRecommendations} disabled={loading}>
          Get Recommendations
        </button>
      </div>

      <div style={{ marginTop: 14 }}>
        <textarea
          rows={4}
          style={{ width: "100%" }}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask: 'What discounts should we run next week?'"
        />
      </div>

      {loading && <p>Working… (make sure Ollama is running)</p>}

      {result && (
        <div style={{ marginTop: 16, padding: 12, border: "1px solid #ddd", borderRadius: 10 }}>
          <h3>Result</h3>
          <pre style={{ whiteSpace: "pre-wrap" }}>
            {JSON.stringify(result.data, null, 2)}
          </pre>

          {result.type === "recs" && (
            <>
              <h4>AI Answer (raw JSON string)</h4>
              <pre style={{ whiteSpace: "pre-wrap" }}>{result.data.answer}</pre>
            </>
          )}
        </div>
      )}

      <p style={{ marginTop: 18, opacity: 0.8 }}>
        Tip: Start by clicking <b>Ingest Sample Orders</b>, then ask about bundles, discount strategy, or churn risks.
      </p>
    </div>
  );
}
