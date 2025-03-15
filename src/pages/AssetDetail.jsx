import { ApiPromise, WsProvider } from "@polkadot/api";
import { RPC_CONFIG, RPC_TYPES } from "../constants/RpcConfs";
import React, { useEffect, useState } from "react";
import Table from "../components/Table";
import { Link } from "react-router-dom";

import ListInfo from "../components/ListInfo";
import { useParams } from "react-router-dom";
const AssetDetail = () => {
  const { number } = useParams();
  const [assetDetail, setAssetDetail] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [errorData, setErrorData] = useState(false);
  const [holders, setHolders] = useState([]);
  const [ propIdx, setPropIdx ] = useState(null);
  const decimalP3D = 1000000000000;
  const symbolP3D = "P3D";

  useEffect(() => {
    const getAssetDetail = async () => {
      try {
        const wsProvider = new WsProvider("wss://rpc.3dpscan.io");
        const api = await ApiPromise.create({
          provider: wsProvider,
          types: RPC_TYPES,
          rpc: RPC_CONFIG,
        });

        // Fetch all assets
        const asset = await api.query.poscanAssets.asset(number);
        const prepareProxIdx = asset.toHuman();
        const metadata = await api.query.poscanAssets.metadata(number);
        const propIdx = await api.query.poScan.properties(prepareProxIdx.objDetails.propIdx);

        setPropIdx(propIdx.toHuman());
        setAssetDetail(asset.toHuman());
        setMetadata(metadata.toHuman());

        // Fetch holders
        const entries = await api.query.poscanAssets.account.entries(number);
        const formattedHolders = entries.map(([key, value]) => {
          const [, address] = key.args.map((arg) => arg.toString());
          const data = value.toHuman();
          return {
            assetId: number,
            address,
            balance: data.balance,
            status: data.status,
            reason: data.reason,
          };
        });

        setHolders(formattedHolders);

        setErrorData(false);
      } catch (error) {
        //console.error("Error fetching balances:", error);
        setErrorData(true);
      }
    };

    getAssetDetail();
  }, [number]);

  if (errorData) {
    return <div className="error">Error fetching asset details.</div>;
  }

  if (!assetDetail || !metadata) {
    return <div className="loading">Loading...</div>;
  }

  const prepareTableArray = (arr, type) => {
    if (!arr.length) {
      return [];
    }

    return arr.map((holder) => [
      { val: holder.assetId },
      { val: <Link to={`/account/${holder.address}`}>{holder.address}</Link> },
      {
        val: `${(
          parseInt(holder.balance.replace(/,/g, "")) /
          Math.pow(10, metadata.decimals)
        ).toFixed(4)} ${metadata.symbol}`,
      },
      { val: holder.status },
      {
        val: holder.reason.DepositFrom
          ? `Deposit From: ${holder.reason.DepositFrom[0].slice(
              0,
              5
            )}...${holder.reason.DepositFrom[0].slice(-5)} (${(
              parseInt(holder.reason.DepositFrom[1].replace(/,/g, "")) /
              decimalP3D
            ).toFixed(4)} ${symbolP3D})`
          : holder.reason,
      },
    ]);
  };
  return (
    <React.Fragment>
      <div className="page-title">Asset Details: {number}</div>
      <div className="info-holder">
        {/* Asset Detail */}
        <div className="page-subtitle">Token: 3DPRC-2</div>
        <ListInfo title={"Name"} info={metadata.name} />
        <ListInfo title={"Symbol"} info={metadata.symbol} />
        <ListInfo title={"Decimals"} info={metadata.decimals} />
        <ListInfo title={"Owner"} info={assetDetail.owner} canCopy={true} />
        <ListInfo title={"Issuer"} info={assetDetail.issuer} canCopy={true} />
        <ListInfo title={"Admin"} info={assetDetail.admin} canCopy={true} />
        <ListInfo title={"Freezer"} info={assetDetail.freezer} canCopy={true} />
        <ListInfo
          title={"Supply"}
          info={`${(
            parseInt(assetDetail.supply.replace(/,/g, "")) /
            Math.pow(10, metadata.decimals)
          ).toFixed(4)} ${metadata.symbol}`}
        />
        <ListInfo
          title={"Max Supply"}
          info={`${(
            parseInt(assetDetail.objDetails.maxSupply.replace(/,/g, "")) /
            Math.pow(10, metadata.decimals)
          ).toFixed(4)} ${metadata.symbol}`}
        />
        <ListInfo
          title={"Deposit"}
          info={`${(
            parseInt(assetDetail.deposit.replace(/,/g, "")) /
            decimalP3D
          ).toFixed(4)} ${symbolP3D}`}
        />
        <ListInfo
          title={"Min Balance"}
          info={`${(
            parseInt(assetDetail.minBalance.replace(/,/g, "")) /
            Math.pow(10, metadata.decimals)
          ).toFixed(4)} ${metadata.symbol}`}
        />
        <ListInfo
          title={"Is Sufficient"}
          info={assetDetail.isSufficient.toString()}
        />
        {/*<ListInfo title={"Accounts"} info={assetDetail.accounts} /> */}
        <ListInfo title={"Sufficients"} info={assetDetail.sufficients} />
        <ListInfo title={"Approvals"} info={assetDetail.approvals} />
        <ListInfo title={"Status"} info={assetDetail.status} />
        <ListInfo title={"Is Frozen"} info={metadata.isFrozen.toString()} />
        <ListInfo title={"Reserved"} info={assetDetail.reserved} />

        {/* Object Details */}
        {assetDetail.objDetails && (
          <>
            <ListInfo
              title={"Object Index"}
              info={
                assetDetail.objDetails.objIdx ? (
                  <Link to={`/object/${assetDetail.objDetails.objIdx}`}>
                    {assetDetail.objDetails.objIdx}
                  </Link>
                ) : (
                  "-"
                )
              }
            />
            <ListInfo
              title={"Property Index"}
              info={assetDetail.objDetails.propIdx}
            />
            {propIdx && ( 
              <ListInfo
                title={"Property index detail"} 
                info={JSON.stringify(propIdx, null, 2)} 
                canCopy={false}
                isCode={true}
              />
            )}
          </>
        )}
      </div>
      <div className="menu-holder">
        <div className="menu-item active">
          Assets holders ({holders.length})
        </div>
      </div>
      <Table
        header={["Asset ID", "Address", "Balance", "Status", "Reason"]}
        array={prepareTableArray(holders, "holders")}
      />
    </React.Fragment>
  );
};

export default AssetDetail;
