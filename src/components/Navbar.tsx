import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      const target = e.target as Node;
      if (open) {
        if (menuRef.current && btnRef.current && !menuRef.current.contains(target) && !btnRef.current.contains(target)) {
          setOpen(false);
        }
      }
    }

    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  function goto(path: string) {
    navigate(path);
    setOpen(false);
  }

  return (
    <header className="navbar-header">
      <div className="navbar-container">
        <div className="navbar-title">Personal Trainer App</div>

        <div className="navbar-hamburger-wrap">
          <button
            ref={btnRef}
            aria-haspopup="true"
            aria-expanded={open}
            aria-label="Open menu"
            onClick={() => setOpen((s) => !s)}
            className="navbar-hamburger"
          >
            <span className="navbar-bar" />
            <span className="navbar-bar" />
            <span className="navbar-bar" />
          </button>

          {open && (
            <div ref={menuRef} role="menu" aria-label="Main menu" className="navbar-menu">
              <button role="menuitem" onClick={() => goto("/customers")}>Customers</button>
              <button role="menuitem" onClick={() => goto("/trainings")}>Trainings</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
