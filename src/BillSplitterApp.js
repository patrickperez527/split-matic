import React, { useState, useEffect } from 'react';
import './BillSplitterApp.css';

function BillSplitterApp() {
  // Each item includes: description, price, and tip percentage (tip is optional)
  const [items, setItems] = useState([
    { id: Date.now(), description: '', price: '', tip: '' }
  ]);
  const [people, setPeople] = useState('');
  const [currency, setCurrency] = useState('PHP'); // Default: Philippine Peso
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [modalMessage, setModalMessage] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showHistoryResetConfirm, setShowHistoryResetConfirm] = useState(false);

  // Load history from local storage on mount
  useEffect(() => {
    const storedHistory = localStorage.getItem('billSplitterHistory');
    if (storedHistory) {
      setHistory(JSON.parse(storedHistory));
    }
  }, []);

  // Save history to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem('billSplitterHistory', JSON.stringify(history));
  }, [history]);

  // Update individual item details
  const updateItem = (id, field, value) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  // Add a new item row.
  // Validation: description must be non-empty, price must be > 0,
  // and if provided, tip must be a valid number ≥ 0.
  const addItem = () => {
    const lastItem = items[items.length - 1];
    if (
      !lastItem.description.trim() ||
      isNaN(parseFloat(lastItem.price)) ||
      parseFloat(lastItem.price) <= 0 ||
      (lastItem.tip !== '' &&
        (isNaN(parseFloat(lastItem.tip)) || parseFloat(lastItem.tip) < 0))
    ) {
      setError('Please fill out the last item properly before adding a new one.');
      return;
    }
    setError('');
    setItems((prevItems) => [
      ...prevItems,
      { id: Date.now(), description: '', price: '', tip: '' }
    ]);
  };

  // Remove an item row (ensure at least one item remains)
  const removeItem = (id) => {
    if (items.length === 1) return;
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  // Get currency symbol based on selection
  const getCurrencySymbol = () => {
    switch (currency) {
      case 'EUR':
        return '€';
      case 'GBP':
        return '£';
      case 'INR':
        return '₹';
      case 'JPY':
        return '¥';
      case 'AUD':
        return 'A$';
      case 'CAD':
        return 'C$';
      case 'CNY':
        return '¥';
      case 'PHP':
      default:
        return '₱';
    }
  };

  // Handle calculation including per-item tip amounts and overall split.
  // Also, each item's share (item total divided by number of people) is computed.
  const handleCalculate = (e) => {
    e.preventDefault();

    // Filter out any item with an empty description or a price <= 0
    const validItems = items.filter((item) => {
      const price = parseFloat(item.price);
      return item.description.trim() !== '' && !isNaN(price) && price > 0;
    });

    if (validItems.length === 0 || !people || parseFloat(people) <= 0) {
      setError('Please enter valid item prices and a valid number of people.');
      setResult(null);
      return;
    }

    // Validate tip percentages if provided for valid items
    for (let item of validItems) {
      if (item.tip !== '' && isNaN(parseFloat(item.tip))) {
        setError('Please enter a valid tip percentage for each item.');
        setResult(null);
        return;
      }
    }

    setError('');

    // Calculate per-item tip amounts and totals using only valid items
    const breakdown = validItems.map((item) => {
      const price = parseFloat(item.price) || 0;
      const tipPercent = item.tip === '' ? 0 : parseFloat(item.tip);
      const tipAmount = price * (tipPercent / 100);
      const totalForItem = price + tipAmount;
      return {
        description: item.description,
        price,
        tipPercent,
        tipAmount,
        totalForItem,
      };
    });

    const totalBill = breakdown.reduce((acc, curr) => acc + curr.price, 0);
    const totalTip = breakdown.reduce((acc, curr) => acc + curr.tipAmount, 0);
    const computedTotal = totalBill + totalTip;
    const computedPerPerson = computedTotal / parseFloat(people);

    const calculationResult = {
      totalBill,
      totalTip,
      computedTotal,
      computedPerPerson,
      date: new Date().toLocaleString(),
      breakdown,
      people,
      currency,
    };

    // Avoid duplicating the same result in history if nothing has changed.
    if (history.length > 0) {
      const lastCalc = history[0];
      if (
        lastCalc.computedTotal === calculationResult.computedTotal &&
        lastCalc.people === calculationResult.people &&
        lastCalc.totalBill === calculationResult.totalBill &&
        lastCalc.totalTip === calculationResult.totalTip &&
        JSON.stringify(lastCalc.breakdown) === JSON.stringify(calculationResult.breakdown)
      ) {
        setResult(calculationResult);
        return;
      }
    }

    setResult(calculationResult);
    setHistory((prev) => [calculationResult, ...prev]);
  };

  // Reset all fields (with confirmation modal)
  const handleReset = () => {
    setItems([{ id: Date.now(), description: '', price: '', tip: '' }]);
    setPeople('');
    setError('');
    setResult(null);
    setShowResetConfirm(false);
  };

  // Clear calculation history (with confirmation modal)
  const handleClearHistory = () => {
    setHistory([]);
    setShowHistoryResetConfirm(false);
  };

  // Copy result details to clipboard and show a modal notification.
  // The breakdown text now includes each item's per person share.
  const copyResultToClipboard = () => {
    if (result) {
      let text = `Bill: ${getCurrencySymbol()}${result.totalBill.toFixed(2)}
Tip: ${getCurrencySymbol()}${result.totalTip.toFixed(2)}
Total: ${getCurrencySymbol()}${result.computedTotal.toFixed(2)}
Per Person: ${getCurrencySymbol()}${result.computedPerPerson.toFixed(2)}\n\nBreakdown:\n`;
      result.breakdown.forEach((item, i) => {
        const perPersonShare = item.totalForItem / parseFloat(people);
        text += `${i + 1}. ${item.description}: ${getCurrencySymbol()}${item.price.toFixed(
          2
        )} + Tip (${item.tipPercent}% = ${getCurrencySymbol()}${item.tipAmount.toFixed(
          2
        )}) = ${getCurrencySymbol()}${item.totalForItem.toFixed(
          2
        )} (Each Person: ${getCurrencySymbol()}${perPersonShare.toFixed(2)})\n`;
      });
      navigator.clipboard.writeText(text.trim());
      setModalMessage('Result copied to clipboard!');
    }
  };

  return (
    <div className="splitter-container">
      <div className="top-bar">
        <h1 className="app-title">SplitMatic</h1>
      </div>

      <form onSubmit={handleCalculate} className="splitter-form">
        <h2>Itemized Bill</h2>
        {items.map((item) => (
          <div key={item.id} className="item-row">
            <input
              type="text"
              placeholder="Description"
              value={item.description}
              onChange={(e) =>
                updateItem(item.id, 'description', e.target.value)
              }
              className="item-description"
            />
            <input
              type="number"
              placeholder="Price"
              value={item.price}
              onChange={(e) => updateItem(item.id, 'price', e.target.value)}
              step="0.01"
              min="0"
              className="item-price"
            />
            <input
              type="number"
              placeholder="Tip % (optional)"
              value={item.tip}
              onChange={(e) => updateItem(item.id, 'tip', e.target.value)}
              step="0.1"
              min="0"
              className="item-tip"
            />
            <button
              type="button"
              onClick={() => removeItem(item.id)}
              className="remove-item-btn"
              title="Remove item"
            >
              &times;
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={addItem}
          className="add-item-btn"
          title="Add new item"
        >
          + Add Item
        </button>

        <div className="input-group">
          <label>Number of People:</label>
          <input
            type="number"
            value={people}
            onChange={(e) => setPeople(e.target.value)}
            placeholder="Enter number of people"
            min="1"
          />
        </div>

        <div className="input-group">
          <label>Currency:</label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          >
            <option value="PHP">₱ PHP</option>
            <option value="USD">$ USD</option>
            <option value="EUR">€ EUR</option>
            <option value="GBP">£ GBP</option>
            <option value="INR">₹ INR</option>
            <option value="JPY">¥ JPY</option>
            <option value="AUD">A$ AUD</option>
            <option value="CAD">C$ CAD</option>
            <option value="CNY">¥ CNY</option>
          </select>
        </div>

        {error && <p className="error">{error}</p>}

        <div className="button-group">
          <button
            type="submit"
            className="calculate-button"
            title="Calculate bill split"
          >
            Calculate
          </button>
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="reset-button"
            title="Reset all fields"
          >
            Reset
          </button>
        </div>
      </form>

      <div className="result">
        <h2>Result</h2>
        {result ? (
          <div className="result-details">
            <p>
              <strong>Total Bill:</strong>{' '}
              <span>
                {getCurrencySymbol()}
                {result.totalBill.toFixed(2)}
              </span>
            </p>
            <p>
              <strong>Total Tip:</strong>{' '}
              <span>
                {getCurrencySymbol()}
                {result.totalTip.toFixed(2)}
              </span>
            </p>
            <p>
              <strong>Total with Tip:</strong>{' '}
              <span>
                {getCurrencySymbol()}
                {result.computedTotal.toFixed(2)}
              </span>
            </p>
            <p>
              <strong>Amount per Person:</strong>{' '}
              <span>
                {getCurrencySymbol()}
                {result.computedPerPerson.toFixed(2)}
              </span>
            </p>

            <div className="breakdown">
              <h3>Breakdown</h3>
              <table>
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Price</th>
                    <th>Tip %</th>
                    <th>Tip Amt</th>
                    <th>Total</th>
                    <th>Per Person</th>
                  </tr>
                </thead>
                <tbody>
                  {result.breakdown.map((item, index) => (
                    <tr key={index}>
                      <td>{item.description}</td>
                      <td>
                        {getCurrencySymbol()}
                        {item.price.toFixed(2)}
                      </td>
                      <td>{item.tipPercent}%</td>
                      <td>
                        {getCurrencySymbol()}
                        {item.tipAmount.toFixed(2)}
                      </td>
                      <td>
                        {getCurrencySymbol()}
                        {item.totalForItem.toFixed(2)}
                      </td>
                      <td>
                        {getCurrencySymbol()}
                        {(item.totalForItem / parseFloat(people)).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              onClick={copyResultToClipboard}
              className="copy-btn"
              title="Copy result to clipboard"
            >
              Copy Result
            </button>
          </div>
        ) : (
          <p>Please fill in the fields and click "Calculate" to see the result.</p>
        )}
      </div>

      {history.length > 0 && (
        <div className="history">
          <h2>Calculation History</h2>
          <button
            onClick={() => setShowHistoryResetConfirm(true)}
            className="clear-history-btn"
            title="Clear history"
          >
            Clear History
          </button>
          <div className="history-list">
            {history.map((entry, index) => (
              <div key={index} className="history-item">
                <p className="history-date">
                  <strong>{entry.date}</strong>
                </p>
                <p className="history-info">
                  {getCurrencySymbol()}
                  {entry.computedTotal.toFixed(2)} total split among {entry.people} people
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal for simple notifications */}
      {modalMessage && (
        <div className="modal-overlay" onClick={() => setModalMessage('')}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <p>{modalMessage}</p>
            <button onClick={() => setModalMessage('')}>Close</button>
          </div>
        </div>
      )}

      {/* Confirmation modal for reset */}
      {showResetConfirm && (
        <div
          className="modal-overlay"
          onClick={() => setShowResetConfirm(false)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <p>Are you sure you want to reset all fields?</p>
            <div className="modal-btn-group">
              <button onClick={handleReset}>Yes</button>
              <button onClick={() => setShowResetConfirm(false)}>No</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation modal for clearing history */}
      {showHistoryResetConfirm && (
        <div
          className="modal-overlay"
          onClick={() => setShowHistoryResetConfirm(false)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <p>Are you sure you want to clear the history?</p>
            <div className="modal-btn-group">
              <button onClick={handleClearHistory}>Yes</button>
              <button onClick={() => setShowHistoryResetConfirm(false)}>
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BillSplitterApp;
