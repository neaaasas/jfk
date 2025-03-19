import { useState, useEffect } from 'react';

const PDFPage = () => {
  const [pdfData, setPdfData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPDFData = async () => {
      try {
        const response = await fetch('/data/jfk_word_counts.json');
        const data = await response.json();
        
        // Convert the object to array and sort by total_israeli_mentions
        const sortedPDFs = Object.entries(data)
          .map(([id, info]) => ({
            id,
            ...info
          }))
          .sort((a, b) => b.total_israeli_mentions - a.total_israeli_mentions)
          .slice(0, 50);

        setPdfData(sortedPDFs);
        setLoading(false);
      } catch (err) {
        setError('Failed to load PDF data');
        setLoading(false);
      }
    };

    fetchPDFData();
  }, []);

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Top 50 PDFs by Israeli Mentions</h1>
      <div className="bg-[#1a1a1a] rounded-lg shadow">
        {pdfData.map((pdf, index) => (
          <div 
            key={pdf.id}
            className="border-b border-gray-800 p-4 hover:bg-[#242424] transition-colors"
          >
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-blue-400">{pdf.id}</h2>
                <p className="text-sm text-gray-400">
                  Total Israeli Mentions: {pdf.total_israeli_mentions}
                </p>
              </div>
              <div className="text-sm text-gray-400">
                Pages: {pdf.total_pages}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PDFPage;
