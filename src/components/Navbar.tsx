import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
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

          {open ? (
            <div ref={menuRef} role="menu" aria-label="Main menu" className="navbar-menu">
              <List component="nav" aria-label="main navigation">
                <ListItem disablePadding>
                  <ListItemButton onClick={() => goto("/customers")}>
                    <ListItemText primary="Customers" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton onClick={() => goto("/trainings")}>
                    <ListItemText primary="Trainings" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton onClick={() => goto("/calendar")}>
                    <ListItemText primary="Calendar" />
                  </ListItemButton>
                </ListItem>
              </List>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
