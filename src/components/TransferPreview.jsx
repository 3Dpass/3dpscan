import { Link, useNavigate } from "react-router-dom";

import { Keyring } from "@polkadot/api";
import moment from "moment";

const TransferPreview = ({ transfer }) => {
  const navigate = useNavigate();
  const {
    blockNumber,
    extrinsicIdx,
    toMultiAddressAccountId,
    fromMultiAddressAccountId,
    value,
    blockDatetime,
    assetName,
    assetSymbol,
  } = transfer;

  const keyring = new Keyring({ ss58Format: 71, type: "sr25519" });

   const encodeAddress = (address) => {
    try {
      return keyring.encodeAddress(address, 71);
    } catch {
      return "Unknown";
    }
  };

 const toAddresses = toMultiAddressAccountId
 ? toMultiAddressAccountId.split(",").map(encodeAddress)
 : ["Unknown"];

const fromAddresses = fromMultiAddressAccountId
 ? fromMultiAddressAccountId.split(",").map(encodeAddress)
 : ["Unknown"];

const openAccount = (e, account) => {
 e.preventDefault();
 if (account !== "Unknown") {
   navigate("/account/" + account);
 }
};

return (
  <Link to={`/extrinsic/${blockNumber}-${extrinsicIdx}`}>
    <div className="home-list-inner">
      <div className="home-list-left">
        <div className="list-left-info mb5">
          Extrinsic#<span>{blockNumber + "-" + extrinsicIdx}</span>
        </div>
        <div className="list-left-info">
          From{" "}
          {fromAddresses.map((acc, index) => (
            <span
              key={index}
              className="ellipsis"
              title={acc}
              onClick={(e) => openAccount(e, acc)}
            >
              {acc}
            </span>
          ))}{" "}
          to{" "}
          {toAddresses.map((acc, index) => (
            <span
              key={index}
              className="ellipsis"
              title={acc}
              onClick={(e) => openAccount(e, acc)}
            >
              {acc}
            </span>
          ))}
        </div>
      </div>
      <div className="home-list-right">
        <div className="transfer-value mb5">
          {assetName
            ? `${"Asset(3DPRC-2)"} ${(value || 0).toFixed(4)} ${assetSymbol}`
            : `${((value || 0) / 1e12).toFixed(4)} P3D`}
        </div>
        <div className="home-timestamp">
          {blockDatetime ? moment(blockDatetime).fromNow() : "Unknown time"}
        </div>
      </div>
    </div>
  </Link>
);
};

export default TransferPreview;
