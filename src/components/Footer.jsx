import "../styles/footer.css";

import { API_BASE_URL } from "../api/axiosHashApi";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="footer-holder">
      <div className="footer-logo"></div>
      <div className="footer-items-holder">
        <div className="footer-item-holder-one">
          <div className="footer-parts-title">Learn More</div>
          <Link className="txtunder" to="https://3dpass.org/features">
            <div className="footer-item">3DPass Features</div>
          </Link>
          <Link className="txtunder" to="https://3dpass.org/community">
            <div className="footer-item">Community</div>
          </Link>
          <Link className="txtunder" to="https://3dpass.org/coin">
            <div className="footer-item">3DPass Coin</div>
          </Link>
          <Link className="txtunder" to={`${API_BASE_URL}api-docs/`}>
            <div className="footer-item">Explorer API</div>
          </Link>
        </div>
        <div className="footer-item-holder-two">
          <div className="footer-parts-title">Follow Our News</div>
          <Link className="txtunder" to="https://3dpass.org">
            <div className="footer-item">Last 3DPass News</div>
          </Link>
          <Link className="txtunder" to="https://discord.gg/u24WkXcwug">
            <div className="footer-item">Discord</div>
          </Link>
          <Link className="txtunder" to="https://t.me/pass3d">
            <div className="footer-item">Telegram</div>
          </Link>
        </div>
        <div className="footer-item-holder-three">
          <div className="footer-parts-title">Keep Updated</div>
          <div className="icon-social-holder">
            <a href="https://twitter.com/3dpass_genesis">
              <div className="social-icon twitter"></div>
            </a>
            <a href="https://github.com/WlinkNET/3dpscan">
              <div className="social-icon github"></div>
            </a>
            <a href="https://discord.gg/u24WkXcwug">
              <div className="social-icon discord"></div>
            </a>
            <a href="https://t.me/pass3d">
              <div className="social-icon telegram"></div>
            </a>
            <a href="https://instagram.com/3dpass_org">
              <div className="social-icon instagram"></div>
            </a>
          </div>

          <div className="footer-parts-title-donation">Donation info</div>
          <div className="icon-donation-holder">
            <div className="donation-address">
              <span style={{ color: "#868686", marginBottom: 50 }}>P3D </span>
              <span>d1H1j9SGoMcJge45CNS81ey4GhMN8jqjte1fbNMgUSBW6Zv4f</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
