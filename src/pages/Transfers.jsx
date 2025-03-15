import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { RPC_CONFIG, RPC_TYPES } from "../constants/RpcConfs";

import { Keyring } from "@polkadot/keyring";
import Pagination from "../components/Pagination";
import Table from "../components/Table";
import axiosInstance from "../api/axios";
import moment from "moment";

const Transfers = () => {
  const { page } = useParams();
  const navigate = useNavigate();
  const [transfers, setTransfers] = useState([]);
  const [pageKey, setPageKey] = useState(null);
  const [pagination, setPagination] = useState({});
  const headersTable = [
    "Extrinsic",
    "Block",
    "From",
    "To",
    "Value",
    "Status",
    "Time",
  ];
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
  useEffect(() => {
    setPageKey(page);
  }, [page, pageKey]);

  useEffect(() => {
    if (pageKey) {

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

      const getTransfers = async () => {
        const postData = {
          query: `query{getTransfers(pageKey: "${pageKey}", pageSize: 12) {pageInfo{pageSize, pageNext, pagePrev}, objects{blockNumber, eventIdx, extrinsicIdx, value, blockDatetime, complete, fromMultiAddressType, fromMultiAddressAccountId, toMultiAddressType, toMultiAddressAccountId}}}`,
        };

        const response = await axiosInstance.post("", postData);
        setPagination(response.data.data.getTransfers.pageInfo);
        return response.data.data.getTransfers.objects;
      };
      
      const checkMissingAssetTransfers = async () => {
        const transfers = await getTransfers();

        const blockNumbers = transfers.map((t) => t.blockNumber);
        const minBlockNumber = Math.min(...blockNumbers);
        const maxBlockNumber = Math.max(...blockNumbers);

        const allBlockNumbers = Array.from(
          { length: maxBlockNumber + 1 - minBlockNumber + 1},
          (_, i) => minBlockNumber + i
        );
                    
        const assetTransfers = await Promise.all(
          allBlockNumbers.map(async (blockNumber) => {
            const existingTransfers = transfers.filter(
              (transfer) => transfer.blockNumber === blockNumber
            );
            const events = await getEventsQuery(blockNumber);
      
            const eventTransfers = await Promise.all(
              events.map(async (event) => {
                const [assetId, fromMultiAddressAccountId, toMultiAddressAccountId, rawAmount] = JSON.parse(
                  event.attributes
                );
      
                const metadata = await getAssetMetadata(assetId);
      
                return {
                  blockNumber: event.blockNumber,
                  eventIdx: event.eventIdx,
                  extrinsicIdx: event.extrinsicIdx,
                  fromMultiAddressAccountId,
                  toMultiAddressAccountId,
                  value: rawAmount / Math.pow(10, metadata.decimals),
                  assetName: metadata.name,
                  assetSymbol: metadata.symbol,
                  rawAmount,
                  blockDatetime: event.blockDatetime,
                };
              })
            );
            return [...existingTransfers, ...eventTransfers];
          })
        );
      
        const enrichedTransfers = assetTransfers.flat();

        const sortedTransfers = enrichedTransfers.sort((a, b) => b.blockNumber - a.blockNumber);
      
        setTransfers(sortedTransfers);
      };
  
      checkMissingAssetTransfers();
    }
  }, [pageKey]);
  const keyring = new Keyring();
  const prepareTableArray = (arr) => {
    if (!arr.length) {
      return [];
    }

    let array = [];
    for (let i = 0; i < arr.length; i++) {
      let item = arr[i];
      let fromEncoded = item.fromMultiAddressAccountId
  ? keyring.encodeAddress(item.fromMultiAddressAccountId, 71)
  : item.from
  ? keyring.encodeAddress(item.from, 71)
  : "Unknown";

      let toEncoded = item.toMultiAddressAccountId
  ? keyring.encodeAddress(item.toMultiAddressAccountId, 71)
  : item.to
  ? keyring.encodeAddress(item.to, 71)
  : "Unknown";

       array.push([
      {
        val: item.blockNumber
          ? `${item.blockNumber}-${item.extrinsicIdx}`
          : "Unknown",
        url: item.blockNumber
          ? `/extrinsic/${item.blockNumber}-${item.extrinsicIdx}`
          : null,
      },
      {
        val: item.blockNumber || "Unknown",
        url: item.blockNumber ? `/block/${item.blockNumber}` : null,
      },
      {
        val: fromEncoded,
        url: fromEncoded !== "Unknown" ? `/account/${fromEncoded}` : null,
      },
      {
        val: toEncoded,
        url: toEncoded !== "Unknown" ? `/account/${toEncoded}` : null,
      },
      {
        val: item.assetName
          ? `${item.value.toFixed(3)} ${item.assetSymbol}`
          : item.value
          ? (item.value / 1000000000000).toFixed(4) + " P3D"
          : "Unknown",
      },
      { val: item.complete ? "Success" : "Asset(3DPRC-2)" },
      { val: moment(item.blockDatetime || new Date()).fromNow() },
    ]);
  }

  return array;
};

  const updatePage = (page) => {
    navigate("/transfers/" + page.toString());
  };

  return (
    <React.Fragment>
      <div className="page-title">TRANSFERS</div>
      <Table header={headersTable} array={prepareTableArray(transfers)} />
      <Pagination
        pagePrev={pagination.pagePrev}
        pageNext={pagination.pageNext}
        setPageKey={updatePage}
      />
    </React.Fragment>
  );
};

export default Transfers;
