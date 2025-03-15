import { ApiPromise, WsProvider } from "@polkadot/api";
import { RPC_CONFIG, RPC_TYPES } from "../constants/RpcConfs";
import Table from "../components/Table";
import React, { useEffect, useState } from "react";

import { Link } from "react-router-dom";

const Assets = () => {
  const headersTable = ["Asset ID", "Name", "Symbol"];
  const [assets, setAssets] = useState([]);

  useEffect(() => {
    const getAllAssets = async () => {
      try {
        const wsProvider = new WsProvider("wss://rpc.3dpscan.io");
        const api = await ApiPromise.create({
          provider: wsProvider,
          types: RPC_TYPES,
          rpc: RPC_CONFIG,
        });

        const allAssets = await api.query.poscanAssets.asset.entries();

        const parsedAssets = allAssets.map(([key]) => key.args[0].toString());

        const assetNames = await Promise.all(
          parsedAssets.map(async (assetId) => {
            const [metadata] = await Promise.all([
              api.query.poscanAssets.metadata(assetId),
            ]);

            const assetMetadata = metadata.toHuman();

            return {
              assetId,
              metadata: assetMetadata,
            };
          })
        );

        setAssets(assetNames);
      } catch (error) {
        //console.error("Error fetching balances:", error);
      }
    };

    getAllAssets();
  }, []);

  const prepareTableArray = (arr) => {
    if (!arr.length) {
      return [];
    }

    const sortedArray = arr.sort((a, b) => parseInt(a.assetId) - parseInt(b.assetId));
  
    let array = [];
    for (let i = 0; i < sortedArray.length; i++) {
      let item = sortedArray[i];
      array.push([
        { val: <Link to={`/assetdetails/${item.assetId}`}>{item.assetId}</Link>, }, 
        { val: item.metadata.name || "N/A" }, 
        { val: item.metadata.symbol || "N/A" },
      ]);
    }
  
    return array;
  };

  return (
    <React.Fragment>
      <div className="page-title">Asset List</div>
      <Table header={headersTable} array={prepareTableArray(assets)} />
    </React.Fragment>
  );
};
export default Assets;
