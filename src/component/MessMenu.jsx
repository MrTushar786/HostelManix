import React, { useEffect, useMemo, useState } from "react";
import "../css/MessMenu.css";
import Navbar from "./Navbar";
import { messMenuAPI } from "../utils/api";

const MessMenu = () => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // all | special | regular
  const [expanded, setExpanded] = useState(null);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadMenu = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await messMenuAPI.getAll();
        const list = (res.data || []).map((item) => ({
          day: item.day || "Day",
          special: !!item.special,
          img: `${String(item.day || "").toLowerCase()}.png`,
          breakfast: item.breakfast || "—",
          lunch: item.lunch || "—",
          dinner: item.dinner || "—",
        }));
        setMenu(list);
      } catch (err) {
        console.error("Failed to fetch mess menu:", err);
        setError(err?.response?.data?.message || "Failed to load mess menu");
      } finally {
        setLoading(false);
      }
    };

    loadMenu();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return menu.filter((m) => {
      const matchesSearch =
        !q ||
        m.day.toLowerCase().includes(q) ||
        m.breakfast.toLowerCase().includes(q) ||
        m.lunch.toLowerCase().includes(q) ||
        m.dinner.toLowerCase().includes(q);

      const matchesFilter =
        filter === "all" ? true : filter === "special" ? m.special : !m.special;

      return matchesSearch && matchesFilter;
    });
  }, [menu, search, filter]);

  const handlePrint = () => window.print();

  const safeImg = (imgName, fallback) => {
    try {
      return new URL(`../assets/food/${imgName}`, import.meta.url).href;
    } catch {
      return `https://via.placeholder.com/640x400?text=${encodeURIComponent(fallback || "Menu")}`;
    }
  };

  // For smooth infinite scroll we duplicate the list — CSS animation translates -50%
  const loopItems = [...filtered, ...filtered];

  return (
    <>
      <Navbar />
      <div className="mess-menu-page">
        <div className="grain-bg" />

        <div className="hero">
          <h1>Weekly Mess Menu</h1>
          <p>Handcrafted meals, served with love</p>

          <div className="controls">
            <input
              type="text"
              placeholder="Search dish or day..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All Days</option>
              <option value="special">Special Only</option>
              <option value="regular">Regular Only</option>
            </select>

            <button className="print-btn" onClick={handlePrint}>Print</button>
          </div>

          {error && <div className="alert error" role="alert">{error}</div>}
        </div>

        <div className="carousel-container" aria-hidden={loading || filtered.length === 0}>
          {loading ? (
            <div style={{ padding: 40, textAlign: "center", color: "#fff" }}>Loading…</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: "#fff" }}>No menu items found.</div>
          ) : (
            <div className="carousel-track">
              {loopItems.map((item, idx) => {
                // use idx because items repeated — keep keys unique
                const key = `${item.day}-${idx}`;
                return (
                  <div
                    key={key}
                    className={`polaroid ${item.special ? "special" : ""}`}
                    onClick={() => setExpanded(item)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && setExpanded(item)}
                  >
                    <img
                      className="food-img"
                      src={safeImg(item.img, item.day)}
                      alt={`${item.day} food`}
                      onError={(e) => {
                        e.currentTarget.src = `https://via.placeholder.com/640x400?text=${encodeURIComponent(item.day)}`;
                      }}
                    />

                    <div className="day-label">{item.day}</div>

                    <div className="menu-list">
                      <div><strong>Breakfast:</strong> {item.breakfast}</div>
                      <div><strong>Lunch:</strong> {item.lunch}</div>
                      <div><strong>Dinner:</strong> {item.dinner}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Expanded view */}
        {expanded && (
          <div className={`expanded show`} onClick={() => setExpanded(null)}>
            <div className="expanded-card" onClick={(e) => e.stopPropagation()}>
              <button className="close-btn" onClick={() => setExpanded(null)}>×</button>
              <img
                className="expanded-img"
                src={safeImg(expanded.img, expanded.day)}
                alt={`${expanded.day} menu`}
                onError={(e) => {
                  e.currentTarget.src = `https://via.placeholder.com/800x500?text=${encodeURIComponent(expanded.day)}`;
                }}
              />
              <div className="expanded-content">
                <h2>{expanded.day} Menu</h2>
                <p><strong>Breakfast:</strong> {expanded.breakfast}</p>
                <p><strong>Lunch:</strong> {expanded.lunch}</p>
                <p><strong>Dinner:</strong> {expanded.dinner}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default MessMenu;
