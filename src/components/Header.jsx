import "../styles/header.css";

import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const Header = () => {
  const location = useLocation().pathname.replace("/", "");
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [chosenOption, setChosenOption] = useState("Block");
  const options = ["Block", "Extrinsic", "Account", "Event", "Tag"];
  const [openMenu, setOpenMenu] = useState(false);
  const [openGovernanceDropdown, setOpenGovernanceDropdown] = useState(false);

  const handleLogoClick = () => {
    navigate("/");
  };

  useEffect(() => {
    setSearch("");
  }, [location]);

  const submitSearch = async (e) => {
    e.preventDefault();

    if (search === "") {
      return false;
    }

    if (chosenOption === "Block") {
      navigate("/block/" + search);
    }

    if (chosenOption === "Extrinsic") {
      navigate("/extrinsic/" + search);
    }

    if (chosenOption === "Account") {
      navigate("/account/" + search);
    }

    if (chosenOption === "Event") {
      navigate("/event/" + search);
    }

    if (chosenOption === "Tag") {
      navigate("/tag/" + search);
    }
  };

  return (
    <>
      <header className="header">
        <div className="header-logo" onClick={handleLogoClick}></div>
        <div className="header-items-holder">
          <div className="header-navs-holder">
            <Link to="/blocks/1">
              <div
                className={
                  location.includes("blocks")
                    ? "header-nav active"
                    : "header-nav"
                }
              >
                Blocks
              </div>
            </Link>
            <Link to="/transfers/1">
              <div
                className={
                  location.includes("transfers")
                    ? "header-nav active"
                    : "header-nav"
                }
              >
                Transfers
              </div>
            </Link>
            <Link to="/events/1">
              <div
                className={
                  location.includes("events")
                    ? "header-nav active"
                    : "header-nav"
                }
              >
                Events
              </div>
            </Link>
            <Link to="/topholders">
              <div
                className={
                  location.includes("topholders")
                    ? "header-nav active"
                    : "header-nav"
                }
              >
                Top Holders
              </div>
            </Link>
            <Link to="/objects">
              <div
                className={
                  location.includes("objects")
                    ? "header-nav active"
                    : "header-nav"
                }
              >
                Objects
              </div>
            </Link>
            <div
              className="header-nav dropdown"
              onMouseEnter={() => setOpenGovernanceDropdown(true)}
              onMouseLeave={() => setOpenGovernanceDropdown(false)}
            >
              Governance
              <div className={openGovernanceDropdown ? "dropdown-content show" : "dropdown-content"}>
                <Link to="/bountie" className="dropdown-item">
                  Bounties
                </Link>
                {/* <Link to="/council" className="dropdown-item">
                  Council
                </Link> */}
              </div>
            </div>
            <Link to="/assets">
              <div
                className={
                  location.includes("assets")
                    ? "header-nav active"
                    : "header-nav"
                }
              >
                Assets
              </div>
            </Link>
            <div
              className="hamburger-menu"
              onClick={() => setOpenMenu(true)}
            ></div>
            <div className={openMenu ? "mobile-menu active" : "mobile-menu"}>
              <div
                className="close-menu"
                onClick={() => setOpenMenu(false)}
              ></div>
              <Link
                to="/blocks/1"
                className="mobilenav"
                onClick={() => setOpenMenu(false)}
              >
                Blocks
              </Link>
              <Link
                to="/transfers/1"
                className="mobilenav"
                onClick={() => setOpenMenu(false)}
              >
                Transfers
              </Link>
              <Link
                to="/events/1"
                className="mobilenav"
                onClick={() => setOpenMenu(false)}
              >
                Events
              </Link>
              <Link
                to="/topholders"
                className="mobilenav"
                onClick={() => setOpenMenu(false)}
              >
                Top Holders
              </Link>
              <Link
                to="/objects"
                className="mobilenav"
                onClick={() => setOpenMenu(false)}
              >
                Objects
              </Link>
              <Link
                to="/bountie"
                className="mobilenav"
                onClick={() => setOpenMenu(false)}
                >
                Bounty
              </Link>
              <Link
                to="/assets"
                className="mobilenav"
                onClick={() => setOpenMenu(false)}
                >
                Assets
              </Link>
            </div>
          </div>
        </div>
      </header>
      <div className="search-header-holder">
        <form className="search-holder" onSubmit={submitSearch}>
          <select
            className="search-select"
            value={chosenOption}
            onChange={(e) => setChosenOption(e.target.value)}
          >
            {options.map((item, i) => (
              <option value={item} key={i}>
                {item}
              </option>
            ))}
          </select>
          <input
            type="text"
            className="search-input"
            placeholder="Search by Block / Extrinsic / Account/ Event / Tag"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="search-button">
            <div className="button-search-icon"></div>
          </button>
        </form>
      </div>
    </>
  );
};

export default Header;
