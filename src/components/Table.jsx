import "../styles/table.css";

import { Link } from "react-router-dom";
import React from "react";

const Table = ({ header, array }) => {
  return (
    <table className="main-table" cellSpacing="0">
      <tbody>
        <tr className="tr-table">
          {header.map((title, i) => (
            <th key={i}>{title}</th>
          ))}
        </tr>
        {array.map((item, i) => (
          <tr key={i} className="main-tr">
            {item.map((info, k) => (
              <React.Fragment key={k}>
                {info.val !== "" && !info.url && <td>{info.val}</td>}
                {info.url && (
                  <td>
                    <Link to={info.url}>{info.val}</Link>
                  </td>
                )}
              </React.Fragment>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Table;
