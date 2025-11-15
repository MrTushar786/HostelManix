import React, { useEffect, useState } from 'react';
import '../css/MessMenu.css';
import Navbar from './Navbar';
import { messMenuAPI } from '../utils/api';

const MessMenu = () => {
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const [expanded, setExpanded] = useState(null);
    const [menu, setMenu] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadMenu = async () => {
            try {
                setLoading(true);
                setError('');
                const res = await messMenuAPI.getAll();
                const items = (res.data || []).map(item => ({
                    day: item.day,
                    special: !!item.special,
                    img: `${item.day.toLowerCase()}.png`,
                    breakfast: item.breakfast,
                    lunch: item.lunch,
                    dinner: item.dinner,
                }));
                setMenu(items);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load mess menu');
            } finally {
                setLoading(false);
            }
        };
        loadMenu();
    }, []);

    const infiniteMenu = menu;

    const filtered = useMemo(() => {
        if (!search && filter === 'all') return infiniteMenu;
        const searchLower = search.toLowerCase();
        return infiniteMenu.filter(m => {
            const matchesSearch = !search || (
                (m.day || '').toLowerCase().includes(searchLower) ||
                (m.breakfast || '').toLowerCase().includes(searchLower) ||
                (m.lunch || '').toLowerCase().includes(searchLower) ||
                (m.dinner || '').toLowerCase().includes(searchLower)
            );
            const matchesFilter = filter === 'all' || (filter === 'special' ? m.special : !m.special);
            return matchesSearch && matchesFilter;
        });
    }, [infiniteMenu, search, filter]);

    const handlePrint = () => window.print();

    return (
        <>
            <Navbar />
            <div className="mess-menu-page">
                <div className="grain-bg" />

                <header className="hero">
                    <h1>Weekly Mess Menu</h1>
                    <p>Handcrafted meals, served with love</p>
                </header>

                <div className="controls">
                    <input
                        type="text"
                        placeholder="Search dish or day..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{ color: '#ffffff' }}
                    />
                    <select 
                        value={filter} 
                        onChange={e => setFilter(e.target.value)}
                        className="styled-select"
                        style={{ color: '#ffffff' }}
                    >
                        <option value="all">All Days</option>
                        <option value="special">Special Only</option>
                        <option value="regular">Regular Only</option>
                    </select>
                    <button className="print-btn" onClick={handlePrint}>Print</button>
                </div>

                {error && (
                    <p className="alert error" role="alert" style={{ marginBottom: '1rem' }}>{error}</p>
                )}
                <div className="carousel-container">
                    <div className="carousel-track">
                        {loading ? (
                            <div className="polaroid">Loading...</div>
                        ) : filtered.map((item, i) => (
                            <div
                                key={`${item.day}-${i}`}
                                className={`polaroid ${item.special ? 'special' : ''}`}
                                onClick={() => setExpanded(item)}
                            >
                                <img
                                    src={new URL(`../assets/food/${item.img}`, import.meta.url).href}
                                    alt={item.day}
                                    className="food-img"
                                    loading="lazy"
                                    onError={e => e.target.src = `https://via.placeholder.com/320x200/333/fff?text=${item.day}`}
                                />
                                <div className="day-label">{item.day}</div>
                                <div className="menu-list">
                                    <strong>Breakfast</strong>: {item.breakfast}<br />
                                    <strong>Lunch</strong>: {item.lunch}<br />
                                    <strong>Dinner</strong>: {item.dinner}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Expanded View */}
                {expanded && (
                    <div className={`expanded ${expanded ? 'show' : ''}`} onClick={() => setExpanded(null)}>
                        <div className="expanded-card" onClick={e => e.stopPropagation()}>
                            <img
                                src={new URL(`../assets/food/${expanded.img}`, import.meta.url).href}
                                alt={expanded.day}
                                className="expanded-img"
                            />
                            <div className="expanded-content">
                                <h2>{expanded.day} Menu</h2>
                                <p><strong>Breakfast:</strong> {expanded.breakfast}</p>
                                <p><strong>Lunch:</strong> {expanded.lunch}</p>
                                <p><strong>Dinner:</strong> {expanded.dinner}</p>
                            </div>
                            <button className="close-btn" onClick={() => setExpanded(null)}>×</button>
                        </div>
                    </div>
                )}


                {/* Print Styles */}
                <style>{`
  @media print {
    .grain-bg, .controls, .expanded { display: none !important; }
    .carousel-track { animation: none !important; display: block !important; }
    .polaroid { float: left; margin: 1rem; page-break-inside: avoid; }
  }
`}</style>

            </div>
        </>
    );
};

export default MessMenu;