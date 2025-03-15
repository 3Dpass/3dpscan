import "../styles/account.css";

import { ApiPromise, WsProvider } from "@polkadot/api";
import { RPC_CONFIG, RPC_TYPES } from "../constants/RpcConfs";
import { Cell, Pie, PieChart } from "recharts";
import React, { useEffect, useState } from "react";

import ErrorData from "../components/ErrorData";
import ListInfo from "../components/ListInfo";
import Pagination from "../components/Pagination";
import QRCode from "react-qr-code";
import Table from "../components/Table";
import axiosInstance from "../api/axios";
import axiosHashInstance from "../api/axiosHashApi";
import classNames from "classnames";
import moment from "moment";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";

const Account = () => {
  const { account } = useParams();
  const [accoutInfo, setAccountInfo] = useState({});
  const [activeMenu, setActiveMenu] = useState("Extrinsics");
  const [extrincts, setExtrincts] = useState([]);
  const extrinctsHeaders = ["Extrinsic ID", "Hash", "Time", "Result"];
  const [pageKeyE, setPageKeyE] = useState(1);
  const [extrinsicBlockNumbers, setExtrinsicBlockNumbers] = useState([]);
  const [paginationE, setPaginationE] = useState({});
  const [pageKeyTo, setPageKeyTo] = useState(1);
  const [paginationTo, setPaginationTo] = useState({});
  const [transfersTo, setTransfersTo] = useState([]);
  const transferToHeader = ["Block", "Extrinsic", "From", "To", "Value"];
  const [pageKeyFrom, setPageKeyFrom] = useState(1);
  const [paginationFrom, setPaginationFrom] = useState({});
  const [transfersFrom, setTransferFrom] = useState([]);
  const [miner, setMiner] = useState("");
  const [miner_raw, setMiner_raw] = useState("");
  const [errorData, setErrorData] = useState(false);
  const { u8aToHex } = require("@polkadot/util");
  const { Keyring } = require("@polkadot/keyring");
  const [judgements, setJudgements] = useState([]);
  const [deposit, setDeposit] = useState("");
  const [info, setInfo] = useState({});
  const [additional, setAdditional] = useState([]);
  const [displayRaw, setDisplayRaw] = useState("");
  const [legal, setLegal] = useState("");
  const [webRaw, setWebRaw] = useState("");
  const [riot, setRiot] = useState("");
  const [emailRaw, setEmailRaw] = useState("");
  const [pgpFingerprint, setPgpFingerprint] = useState("");
  const [image, setImage] = useState("");
  const [twitterRaw, setTwitterRaw] = useState("");
  const [assetBalances, setAssetBalances] = useState([]);

  useEffect(() => {
    const getAccountInfo = async (acc) => {
      const wsProvider = new WsProvider("wss://rpc.3dpscan.io");
      const api = await ApiPromise.create({ provider: wsProvider });
      const pero = await api.query.system.account(acc);
      const free =
        Number(pero.data.toHuman().free.replaceAll(",", "")) / 1000000000000;
      const miscFrozen =
        Number(pero.data.toHuman().miscFrozen.replaceAll(",", "")) /
        1000000000000;
      const feeFrozen =
        Number(pero.data.toHuman().feeFrozen.replaceAll(",", "")) /
        1000000000000;
      const reserved =
        Number(pero.data.toHuman().reserved.replaceAll(",", "")) /
        1000000000000;
      const transferable = free - miscFrozen;

      let objectAccount = {
        free: Math.round(free),
        miscFrozen: Math.round(miscFrozen),
        feeFrozen: Math.round(feeFrozen),
        reserved: Math.round(reserved),
        transferable: Math.round(transferable),
      };

      setAccountInfo(objectAccount);
      const keyring = new Keyring();
      const minerEncoded = keyring.encodeAddress(account, 71);
      setMiner(minerEncoded);
      let minerDecoded;
      if (acc.startsWith("d1")) {
        const decodedAcc = keyring.decodeAddress(acc);
        const publicKey = u8aToHex(decodedAcc);
        minerDecoded = publicKey;
        setMiner_raw(minerDecoded);
      } else {
        minerDecoded = acc;
        setMiner_raw(minerDecoded);
      }
    };

    getAccountInfo(account);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, Keyring]);

  useEffect(() => {
    if (miner) {
      getBalancesForAccount(miner);
    }
  }, [miner]);

  useEffect(() => {
    getExtrincts(account, pageKeyE);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, pageKeyE]);

  useEffect(() => {
    getTransfersTo(account, pageKeyTo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [extrinsicBlockNumbers, account, pageKeyTo]);

  useEffect(() => {
    getTransfersFrom(account, pageKeyFrom);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [extrinsicBlockNumbers, account, pageKeyFrom]);

  useEffect(() => {
    const fetchData = async () => {
      setJudgements([]);
      setDeposit("-");
      setInfo({});
      setAdditional([]);
      setDisplayRaw("-");
      setLegal("-");
      setWebRaw("-");
      setRiot("-");
      setEmailRaw("-");
      setPgpFingerprint("-");
      setImage("-");
      setTwitterRaw("-");

      try {
        const response = await axiosHashInstance.get(`/identity/${miner}`);

        if (response && response.data) {
          const data = response.data;
          setJudgements(data.judgements || []);
          setDeposit(data.deposit || "-");
          setInfo(data.info || {});
          setAdditional(
            data.info?.additional?.map((item) => ({
              name: item[0]?.Raw || "-",
              value: item[1]?.Raw || "-",
            })) || []
          );
          setDisplayRaw(data.info?.display?.Raw || "-");
          setLegal(data.info?.legal?.Raw || "-");
          setWebRaw(data.info?.web?.Raw || "-");
          setRiot(data.info?.riot || "-");
          setEmailRaw(data.info?.email?.Raw || "-");
          setPgpFingerprint(data.info?.pgpFingerprint || "-");
          setImage(data.info?.image || "-");
          setTwitterRaw(data.info?.twitter?.Raw || "-");
        }
      } catch (error) {
        //console.error("Error fetching identity data:", error);
        // Reset to default values in case of an error
        setJudgements([]);
        setDeposit("-");
        setInfo({});
        setAdditional([]);
        setDisplayRaw("-");
        setLegal("-");
        setWebRaw("-");
        setRiot("-");
        setEmailRaw("-");
        setPgpFingerprint("-");
        setImage("-");
        setTwitterRaw("-");
      }
    };

    if (miner.startsWith("d1")) {
      fetchData();
    }
  }, [miner]);

  const syncExtrinsicsPagination = (pageKey) => {
    setPageKeyE(pageKey);
  };

  const getBalancesForAccount = async (address) => {
    try {
      const wsProvider = new WsProvider("wss://rpc.3dpscan.io");
      const api = await ApiPromise.create({
        provider: wsProvider,
        types: RPC_TYPES,
        rpc: RPC_CONFIG,
      });

      // Fetch all assets
      const allAssets = await api.query.poscanAssets.asset.entries();

      // Transform asset entries into a human-readable format
      const parsedAssets = allAssets.map(([key]) => key.args[0].toString());

      // Iterate through asset IDs and fetch account balances + metadata
      const balances = await Promise.all(
        parsedAssets.map(async (assetId) => {
          const [accountBalance, metadata] = await Promise.all([
            api.query.poscanAssets.account(assetId, address),
            api.query.poscanAssets.metadata(assetId),
          ]);

          const humanBalance = accountBalance.toHuman();
          const assetMetadata = metadata.toHuman();

          return {
            assetId,
            balance: humanBalance,
            metadata: assetMetadata,
          };
        })
      );

      // Filter non-null balances
      const nonNullBalances = balances.filter(
        (item) => item.balance !== null && item.balance.balance !== "0"
      );

      setAssetBalances(nonNullBalances);
    } catch (error) {
      //console.error("Error fetching balances:", error);
    }
  };

  const getAssetMetadata = async (assetId) => {
    const wsProvider = new WsProvider("wss://rpc.3dpscan.io");
    const api = await ApiPromise.create({
      provider: wsProvider,
      types: RPC_TYPES,
      rpc: RPC_CONFIG,
    });

    const assetDetails = await api.query.poscanAssets.metadata(assetId);
    const metadata = assetDetails.toHuman();
    return metadata;
  };

  const getEventsQuery = async (blockNumber) => {
    const postData = {
      query: `query {
          getEvents(
            pageKey: "1",
            pageSize: 100,
            filters: {
              blockNumber: ${blockNumber},
              eventModule: "PoscanAssets",
              eventName: "Transferred"
            }
          ) {
            objects {
              blockNumber,
              blockDatetime,
              eventIdx,
              extrinsicIdx,
              event,
              eventName,
              eventModule,
              phaseIdx,
              phaseName,
              attributes,
              topics,
              complete
            }
          }
        }`,
    };

    const response = await axiosInstance.post("", postData);

    return response.data.data.getEvents.objects;
  };

  const getExtrincts = async (acc, pageKey) => {
    let address;
    if (acc.startsWith("d1")) {
      const keyring = new Keyring({ ss58Format: 71, type: "sr25519" });
      const decodedAcc = keyring.decodeAddress(acc);
      const publicKey = u8aToHex(decodedAcc);
      address = publicKey;
    } else {
      address = acc;
    }
    const getTransfers = {
      query: `query{getExtrinsics(pageKey: "${pageKey}", pageSize: 10, filters: {multiAddressAccountId: "${address}"}){pageInfo{pageSize, pageNext, pagePrev} objects{ blockNumber, blockDatetime, extrinsicIdx, hash, complete }}}`,
    };

    const responseExtrincts = await axiosInstance.post("", getTransfers);

    if (responseExtrincts.data && responseExtrincts.data.data.getExtrinsics) {
      const extrinsics = responseExtrincts.data.data.getExtrinsics.objects;
      setExtrincts(responseExtrincts.data.data.getExtrinsics.objects);
      const blockNumbers = extrinsics.map((extrinsic) => extrinsic.blockNumber);

      setExtrinsicBlockNumbers(blockNumbers);
      setPaginationE(responseExtrincts.data.data.getExtrinsics.pageInfo);
      setErrorData(false);
    } else {
      setErrorData(true);
    }
  };
  const getTransfersTo = async (acc, pageKey) => {
    let address;
    if (acc.startsWith("d1") || acc.startsWith("5")) {
      const keyring = new Keyring({ ss58Format: 71, type: "sr25519" });
      const decodedAcc = keyring.decodeAddress(acc);
      const publicKey = u8aToHex(decodedAcc);
      address = publicKey;
    } else {
      address = acc;
    }
    const postTransfers = {
      query: `query{getTransfers(pageKey: "${pageKey}", pageSize: 10, filters: {toMultiAddressAccountId: "${address}"}){pageInfo{pageSize, pageNext, pagePrev} objects{ blockNumber, extrinsicIdx, eventIdx, fromMultiAddressAccountId, toMultiAddressAccountId, value }}}`,
    };

    const responseTransfers = await axiosInstance.post("", postTransfers);
    const transfers = responseTransfers.data?.data?.getTransfers?.objects || [];

    const relevantBlockNumbers = extrinsicBlockNumbers;

    const assetTransfers = await Promise.all(
      relevantBlockNumbers.map(async (blockNumber) => {
        const events = await getEventsQuery(blockNumber);

        const eventTransfers = await Promise.all(
          events.map(async (event) => {
            const [assetId, from, to, rawAmount] = JSON.parse(event.attributes);
            const metadata = await getAssetMetadata(assetId);

            if (to === address) {
              return {
                blockNumber: event.blockNumber,
                extrinsicIdx: event.extrinsicIdx,
                eventIdx: event.eventIdx,
                fromMultiAddressAccountId: from,
                toMultiAddressAccountId: to,
                value: rawAmount / Math.pow(10, metadata.decimals),
                assetName: metadata.name,
                assetSymbol: metadata.symbol,
                rawAmount,
                blockDatetime: event.blockDatetime,
              };
            }
            return null;
          })
        );

        return eventTransfers.filter((transfer) => transfer !== null);
      })
    );

    const enrichedTransfers = [...transfers, ...assetTransfers.flat()].sort(
      (a, b) => b.blockNumber - a.blockNumber
    );

    setTransfersTo(enrichedTransfers);
    setPaginationTo(responseTransfers.data.data.getTransfers.pageInfo);
  };

  const getTransfersFrom = async (acc, pageKey) => {
    const { u8aToHex } = require("@polkadot/util");
    const { Keyring } = require("@polkadot/keyring");

    let address;
    if (acc.startsWith("d1") || acc.startsWith("5")) {
      const keyring = new Keyring({ ss58Format: 71, type: "sr25519" });
      const decodedAcc = keyring.decodeAddress(acc);
      const publicKey = u8aToHex(decodedAcc);
      address = publicKey;
    } else {
      address = acc;
    }
    const postTransfers = {
      query: `query{getTransfers(pageKey: "${pageKey}", pageSize: 10, filters: {fromMultiAddressAccountId: "${address}"}){pageInfo{pageSize, pageNext, pagePrev} objects{ blockNumber, extrinsicIdx, eventIdx, fromMultiAddressAccountId, toMultiAddressAccountId, value }}}`,
    };

    const responseTransfers = await axiosInstance.post("", postTransfers);
    const transfers = responseTransfers.data?.data?.getTransfers?.objects || [];

    const relevantBlockNumbers = extrinsicBlockNumbers;

    const assetTransfers = await Promise.all(
      relevantBlockNumbers.map(async (blockNumber) => {
        const events = await getEventsQuery(blockNumber);

        const eventTransfers = await Promise.all(
          events.map(async (event) => {
            const [assetId, from, to, rawAmount] = JSON.parse(event.attributes);
            const metadata = await getAssetMetadata(assetId);

            if (from === address) {
              return {
                blockNumber: event.blockNumber,
                extrinsicIdx: event.extrinsicIdx,
                eventIdx: event.eventIdx,
                fromMultiAddressAccountId: from,
                toMultiAddressAccountId: to,
                value: `Asset(3DPRC-2) ${(rawAmount / Math.pow(10, metadata.decimals)).toFixed(3)}`,
                assetName: metadata.name,
                assetSymbol: metadata.symbol,
                rawAmount,
                blockDatetime: event.blockDatetime,
              };
            }

            return null;
          })
        );

        return eventTransfers.filter((transfer) => transfer !== null);
      })
    );

    const enrichedTransfers = [...transfers, ...assetTransfers.flat()].sort(
      (a, b) => b.blockNumber - a.blockNumber
    );

    setTransferFrom(enrichedTransfers);
    setPaginationFrom(responseTransfers.data.data.getTransfers.pageInfo);
  };

  const prepareTableArray = (arr, type) => {
    if (!arr.length) {
      return [];
    }

    let array = [];
    for (let i = 0; i < arr.length; i++) {
      let item = arr[i];
      let fromEncoded;
      let toEncoded;

      const keyring = new Keyring({ ss58Format: 71, type: "sr25519" });

      if (item.fromMultiAddressAccountId) {
        fromEncoded = keyring.encodeAddress(item.fromMultiAddressAccountId);
      }

      if (item.toMultiAddressAccountId) {
        toEncoded = keyring.encodeAddress(item.toMultiAddressAccountId);
      }

      if (type === "extrincts") {
        array.push([
          {
            val: item.blockNumber + "-" + item.extrinsicIdx,
            url: "/extrinsic/" + item.blockNumber + "-" + item.extrinsicIdx,
          },
          { val: item.hash },
          { val: moment(item.blockDatetime).fromNow() },
          { val: item.complete === 1 ? "Success" : "Not Success" },
        ]);
      }

      if (type === "transfersTo" || type === "transfersFrom") {
        array.push([
          { val: item.blockNumber, url: "/block/" + item.blockNumber },
          {
            val: item.blockNumber + "-" + item.extrinsicIdx,
            url: "/extrinsic/" + item.blockNumber + "-" + item.extrinsicIdx,
          },
          {
            val: fromEncoded,
            url: "/account/" + fromEncoded,
          },
          {
            val: toEncoded,
            url: "/account/" + toEncoded,
          },
          {
            val: item.assetName
              ? `${item.value} ${item.assetSymbol}`
              : item.value
              ? (item.value / 1000000000000).toFixed(4) + " P3D"
              : "Unknown",
          },
        ]);
      }
    }
    return array;
  };

  const data = [
    { name: "Locked", value: accoutInfo.miscFrozen, color: "#00EB81" },
    { name: "Transferable", value: accoutInfo.transferable, color: "#0B828C" },
  ];

  let judgementItems = [];

  if (judgements && judgements.length > 0) {
    judgements.forEach((judgement, index) => {
      judgementItems.push(
        <ListInfo
          key={`registrar-index-${index}`}
          title={`Registrar index (${index})`}
          info={judgement[0]}
          canCopy={false}
        />
      );

      if (typeof judgement[1] === "object") {
        for (const key in judgement[1]) {
          const value = judgement[1][key];
          judgementItems.push(
            <ListInfo
              key={`registrar-value-${index}-${key}`}
              title={key}
              info={value}
              canCopy={false}
            />
          );
        }
      } else {
        judgementItems.push(
          <ListInfo
            key={`registrar-level-${index}`}
            title={`Level of confidence (${index})`}
            info={judgement[1]}
            canCopy={false}
          />
        );
      }
    });
  }

  return (
    <React.Fragment>
      <div className="page-title">ACCOUNT</div>
      {!errorData && (
        <React.Fragment>
          <div className="account-info-header">Balance</div>
          <div className="account-info-holder">
            <div className="account-left-info">
              <div className="graph-holder-account">
                <PieChart width={200} height={200}>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {data.map((item, index) => (
                      <Cell key={`cell-${index}`} fill={item.color} />
                    ))}
                  </Pie>
                </PieChart>
              </div>
              <div className="graph-info-account">
                {data.map((item, i) => (
                  <div className="one-graph-info" key={i}>
                    <div
                      className="graph-color"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <div className="graph-label">
                      {item.name}{" "}
                      <span className="block-span">{item.value} P3D</span>
                    </div>
                  </div>
                ))}

                <div className="total-balance-infob">
                  Total Balance <span>{accoutInfo.free} P3D</span>
                </div>
              </div>
            </div>
            <div className="account-right-info">
              <QRCode
                size={120}
                value={window.location.href}
                viewBox={`0 0 120 120`}
              />
            </div>
          </div>

          <div className="account-info-header">Assets Balance</div>
          <div className="account-info-holder">
            <div className="balance-wrapper">
              {assetBalances.map(({ assetId, balance, metadata }) => (
                <div key={assetId} className="total-balance-info">
                  <div>
                    Asset ID:
                    <Link
                      to={`/object/${assetId}`}
                      style={{ textDecoration: "none", cursor: "pointer" , color: "#00eb81"}}
                    >
                      <span>{assetId}</span>
                    </Link>
                  </div>
                  <div>
                    Total Balance:{""}{" "}
                    <span>
                      {" "}
                      {parseFloat(balance.balance.replace(/,/g, "")) /
                        Math.pow(10, metadata.decimals)}{" "}
                      {metadata.symbol}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="info-holder">
            <ListInfo title={"Account Id"} info={miner_raw} canCopy={true} />
            <ListInfo title={"Address"} info={miner} canCopy={true} />
            {judgementItems}
            {deposit && (
              <ListInfo
                title={"Registrar fee"}
                info={(
                  parseFloat(deposit.replaceAll(",", "")) / 1000000000000
                ).toFixed(4)}
                canCopy={false}
              />
            )}
            {displayRaw && (
              <div>
                <ListInfo
                  title={"Name"}
                  info={displayRaw || "-"}
                  canCopy={false}
                />
              </div>
            )}
            {legal && legal !== "None" && (
              <ListInfo title={"Legal"} info={legal || "-"} canCopy={false} />
            )}
            {webRaw && (
              <ListInfo
                title={"Web Site"}
                info={webRaw || "-"}
                canCopy={false}
              />
            )}
            {riot && riot !== "None" && (
              <ListInfo title={"Riot"} info={riot} canCopy={false} />
            )}
            {emailRaw && (
              <ListInfo
                title={"Email"}
                info={emailRaw || "-"}
                canCopy={false}
              />
            )}
            {pgpFingerprint && (
              <ListInfo
                title={"PGP Fingerprint"}
                info={pgpFingerprint || "-"}
                canCopy={false}
              />
            )}
            {image && image !== "None" && (
              <ListInfo title={"image"} info={image} canCopy={false} />
            )}
            {twitterRaw && (
              <ListInfo title={"Twitter"} info={twitterRaw} canCopy={false} />
            )}
            {additional && additional.length > 0 && (
              <div>
                {additional.map((item, index) => (
                  <ListInfo
                    key={index}
                    title={item.name}
                    info={item.value}
                    canCopy={false}
                  />
                ))}
              </div>
            )}
          </div>
          <div className="menu-holder">
            <div
              className={classNames({
                "menu-item": true,
                active: activeMenu === "Extrinsics",
              })}
              onClick={() => setActiveMenu("Extrinsics")}
            >
              Extrinsics
            </div>
            <div
              className={classNames({
                "menu-item": true,
                active: activeMenu === "Transfers To",
              })}
              onClick={() => setActiveMenu("Transfers To")}
            >
              Transfers to Account
            </div>
            <div
              className={classNames({
                "menu-item": true,
                active: activeMenu === "Transfers From",
              })}
              onClick={() => setActiveMenu("Transfers From")}
            >
              Transfers from Account
            </div>
          </div>
          {activeMenu === "Extrinsics" && (
            <>
              <Table
                header={extrinctsHeaders}
                array={prepareTableArray(extrincts, "extrincts")}
              />
              {extrincts.length === 0 && (
                <div className="empty-state">No available data.</div>
              )}
              <Pagination
                pagePrev={paginationE.pagePrev}
                pageNext={paginationE.pageNext}
                setPageKey={setPageKeyE}
              />
            </>
          )}
          {activeMenu === "Transfers To" && (
            <>
              <Table
                header={transferToHeader}
                array={prepareTableArray(transfersTo, "transfersTo")}
              />
              {transfersTo.length === 0 && (
                <div className="empty-state">No available data.</div>
              )}
              <Pagination
                pagePrev={paginationTo.pagePrev}
                pageNext={paginationTo.pageNext}
                setPageKey={(newPageKey) => {
                  setPageKeyTo(newPageKey);
                  syncExtrinsicsPagination(newPageKey);
                }}
              />
            </>
          )}
          {activeMenu === "Transfers From" && (
            <>
              <Table
                header={transferToHeader}
                array={prepareTableArray(transfersFrom, "transfersFrom")}
              />
              {transfersFrom.length === 0 && (
                <div className="empty-state">No available data.</div>
              )}
              <Pagination
                pagePrev={paginationFrom.pagePrev}
                pageNext={paginationFrom.pageNext}
                setPageKey={(newPageKey) => {
                  setPageKeyFrom(newPageKey);
                  syncExtrinsicsPagination(newPageKey);
                }}
              />
            </>
          )}
        </React.Fragment>
      )}
      {errorData && <ErrorData error={"No available data for Account"} />}
    </React.Fragment>
  );
};

export default Account;
