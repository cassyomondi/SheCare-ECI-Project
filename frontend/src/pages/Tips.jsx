import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Tips.css';

function Tips() {
    const [tips, setTips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [metrics, setMetrics] = useState({
        totalTips: 0,
        activeTips: 0,
        monthlyTipsSent: 0,
        verificationRate: 0
    });

    useEffect(function() {
        fetchTips();
    }, []);

    useEffect(function() {
        calculateMetrics();
    }, [tips]);

    async function fetchTips() {
        try {
            const response = await axios.get('http://127.0.0.1:5555/api/tips');
            setTips(response.data);
        } catch (error) {
            console.error('Error fetching tips:', error);
        } finally {
            setLoading(false);
        }
    }

    function calculateMetrics() {
        if (tips.length === 0) return;

        const totalTips = tips.length;
        const activeTips = tips.filter(tip => tip.status === true).length;
        
        // Calculate monthly tips sent (tips created this month)
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const monthlyTipsSent = tips.filter(tip => {
            const tipDate = new Date(tip.timestamp);
            return tipDate.getMonth() === currentMonth && tipDate.getFullYear() === currentYear;
        }).length;

        //Calculate verification rate (tips with verified_timestamp)
        
        const verifiedTips = tips.filter(tip => tip.status === true).length;
        const verificationRate = totalTips > 0 ? Math.round((verifiedTips / totalTips) * 100) : 0;

        setMetrics({
            totalTips,
            activeTips,
            monthlyTipsSent,
            verificationRate
        });
    }

    if (loading) {
        return <div className="tips-loading">Loading tips analytics...</div>;
    }

    return (
        <div className="tips-container">
            <div className="tips-header">
                <h1 className="tips-title">Tips Analytics</h1>
                <p className="tips-subtitle">Overview of tips performance and metrics</p>
            </div>

          {/*Metrics Card*/}
            <div className="metrics-grid">
                <div className="metric-card">
                    <div className="metric-icon total-tips-icon">📊</div>
                    <div className="metric-content">
                        <h3 className="metric-title">Total Tips</h3>
                        <div className="metric-value">{metrics.totalTips}</div>
                    </div>
                </div>

                <div className="metric-card">
                    <div className="metric-icon active-tips-icon">✅</div>
                    <div className="metric-content">
                        <h3 className="metric-title">Active Tips</h3>
                        <div className="metric-value">{metrics.activeTips}</div>
                    </div>
                </div>

                <div className="metric-card">
                   
                    <div className="metric-content">
                        <h3 className="metric-title">Sent This Month</h3>
                        <div className="metric-value">{metrics.monthlyTipsSent}</div>
                    </div>
                </div>

                <div className="metric-card">
                    <div className="metric-icon verification-icon">🔍</div>
                    <div className="metric-content">
                        <h3 className="metric-title">Active Rate</h3>
                        <div className="metric-value">{metrics.verificationRate}%</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Tips;