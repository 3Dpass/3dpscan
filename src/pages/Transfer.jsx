import "../styles/block.css";

import { ApiPromise, WsProvider } from "@polkadot/api";
import React, { useEffect, useState } from "react";
import { RPC_CONFIG, RPC_TYPES } from "../constants/RpcConfs";
import ErrorData from "../components/ErrorData";
import ListInfo from "../components/ListInfo";
import Table from "../components/Table";
import axiosInstance from "../api/axios";
import axiosHashInstance from "../api/axiosHashApi";
import moment from "moment";
import { useParams } from "react-router-dom";
const { Keyring } = require("@polkadot/keyring");

const Transfer = () => {
  const { number } = useParams();
  const [extrinsic, setExtrinsic] = useState({});
  const [extrinsicInfo, setExtrinsicInfo] = useState({});
  const eventsHeader = [
    "Event ID",
    "Extrinct ID",
    "Event Module",
    "Event Name",
  ];
  const [events, setEvents] = useState([]);
  const [errorData, setErrorData] = useState(false);

  useEffect(() => {
    const wsProvider = new WsProvider("wss://rpc.3dpscan.io");
    const splitParam = number.split("-");

    const handleExtrinsicHashSearch = async () => {
      try {
        const response = await axiosHashInstance.get(`/hash/${number}`);
        const { blockNumber, extrinsicIdx } = response.data;
        getExtrinsic(blockNumber, extrinsicIdx);
      } catch (error) {
        setErrorData(true);
      }
    };

    const fetchMetadata = async (assetId) => {
      const wsProvider = new WsProvider("wss://rpc.3dpscan.io");
      const api = await ApiPromise.create({
        provider: wsProvider,
        types: RPC_TYPES,
        rpc: RPC_CONFIG,
      });
      const assetDetails = await api.query.poscanAssets.metadata(assetId);
      return assetDetails.toHuman();
    };

    const getExtrinsic = async (blockNumber, number) => {
      const postData = {
        query: `{
                getExtrinsic(filters: {blockNumber: ${blockNumber} extrinsicIdx: ${number} })
                  {
                    blockNumber
                    extrinsicIdx
                    extrinsicLength
                    hash
                    version
                    versionInfo
                    call
                    callModule
                    callName
                    callArguments
                    callHash
                    signed
                    signature
                    signatureVersion
                    multiAddressRaw
                    multiAddressType
                    multiAddressAccountId
                    multiAddressAddress32
                    multiAddressAddress20
                    multiAddressAccountIndex
                    nonce
                    era
                    eraImmortal
                    eraBirth
                    eraDeath
                    tip
                    blockDatetime
                    blockHash
                    specName
                    specVersion
                    complete
                  }
                }`,
      };
      const response = await axiosInstance.post("", postData);

      if (response.data.data && response.data.data.getExtrinsic) {
        setExtrinsic(response.data.data.getExtrinsic);
        setErrorData(false);

        let transferValue = 0;
        let parsedArguments = JSON.parse(
          response.data.data.getExtrinsic.callArguments
        );
        
        let assetId = null;
        let destination = null;
        for (let arg of parsedArguments) {
          if (arg.name === "id" && arg.type === "AssetId") {
            assetId = arg.value;
          }
          if ((arg.name === "amount" || arg.name === "value") && arg.type === "Balance") {
            transferValue = arg.value;
          }
          if ((arg.name === "target" || arg.name === "dest") && arg.type === "LookupSource") {
            destination = arg.value;
          }
        }

        let eventsArray = [];
        const postEvent = {
          query: `{
            getEvents(filters: {blockNumber: ${blockNumber} extrinsicIdx: ${number}})
              {
                objects {
                eventIdx
                event
                eventName
                eventModule
                extrinsicIdx
                phaseIdx
                phaseName
                complete
                attributes
                topics
                blockDatetime
                blockHash
                specName
                specVersion
                }
              }
          }`,
        };

        const responseEvent = await axiosInstance.post("", postEvent);
        eventsArray.push(responseEvent.data.data.getEvents);        

        setEvents(eventsArray[0].objects);

        const api = await ApiPromise.create({ provider: wsProvider });
        const blockHash = response.data.data.getExtrinsic.blockHash;
        const { block } = await api.rpc.chain.getBlock(blockHash);

        const queryFeeDetails = await api.rpc.payment.queryFeeDetails(
          block.extrinsics[1].toHex(),
          blockHash
        );

        const feedInfo = JSON.parse(
          JSON.stringify(queryFeeDetails.toHuman(), null, 2)
        );

        let baseFee = feedInfo?.inclusionFee?.baseFee
          ? feedInfo.inclusionFee.baseFee.split(" ")[0]
          : "0";
        let finalBaseFee = Number(baseFee);
        let lenFee = feedInfo?.inclusionFee?.lenFee
          ? feedInfo.inclusionFee.lenFee.split(" ")[0].replaceAll(".", "")
          : "0";
        let finalLenFee = Number(lenFee);
        let convertLen = finalLenFee / 10000000;
        let estimatedFee = finalBaseFee + convertLen;

        const queryInfo = await api.rpc.payment.queryInfo(
          block.extrinsics[1].toHex(),
          blockHash
        );

        const parsedInfo = JSON.parse(
          JSON.stringify(queryInfo.toHuman(), null, 2)
        );

        let assetSymbol = "";
        let assetDecimals;

        if (assetId) {
          const metadata = await fetchMetadata(assetId);
          assetSymbol = metadata.symbol;
          assetDecimals = parseInt(metadata.decimals, 10);
        }

        const formattedValue = assetId
          ? (transferValue / Math.pow(10, assetDecimals)).toFixed(4) +
            ` ${assetSymbol}`
          : transferValue / 1000000000000 + " P3D";

        const keyring = new Keyring();

        let encodedDestination
        if(destination){
          encodedDestination = keyring.encodeAddress(destination, 71);
        }

        let signerId = block.extrinsics.find(
          (extrinsic) => extrinsic?.isSigned
        )?.signer?.Id;

        const sender = response.data.data.getExtrinsic.multiAddressAccountId;
        if (!signerId){
          signerId = keyring.encodeAddress(sender, 71);
        }
        
        let object = {
          value: formattedValue,
          sender: signerId || "-", 
          destination: encodedDestination || "-",
          partialFee: parsedInfo.partialFee || "-",
          estimatedFee: estimatedFee + " mP3D" || "-",
        };

        setExtrinsicInfo(object);
      } else {
        setErrorData(true);
      }
    };

    if (number.includes("-")) {
      getExtrinsic(splitParam[0], splitParam[1]);
    } else {
      handleExtrinsicHashSearch();
    }
  }, [number]);

  const prepareTableArray = (arr, type) => {
    if (!arr.length) {
      return [];
    }

    let array = [];

    for (let i = 0; i < arr.length; i++) {
      let item = arr[i];

      const indexEvent = blockNumber + "-" + item.eventIdx;
      const extrinsicIndex = blockNumber + "-" + item.extrinsicIdx;

      if (type === "events") {
        array.push([
          { val: indexEvent, url: "/event/" + indexEvent },
          { val: extrinsicIndex, url: "/extrinsic/" + extrinsicIndex },
          { val: item.eventModule },
          { val: item.eventName },
        ]);
      }
    }

    return array;
  };

  const {
    blockDatetime,
    blockNumber,
    hash,
    callModule,
    callName,
    signature,
    complete,
    nonce,
    callArguments,
  } = extrinsic;

  const { value, sender, destination, partialFee, estimatedFee } =
    extrinsicInfo;

  return (
    <React.Fragment>
      <div className="page-title">EXTRINSIC #{number}</div>
      {!errorData && (
        <React.Fragment>
          <div className="info-holder">
            <ListInfo
              title={"Block Time"}
              info={moment(blockDatetime).fromNow()}
              canCopy={false}
            />
            <ListInfo
              title={"Block"}
              info={blockNumber}
              canCopy={false}
              url={"/block/" + blockNumber}
            />
            <ListInfo title={"Extrinsic Hash"} info={hash} canCopy={true} />
            <ListInfo title={"Module"} info={callModule} canCopy={false} />
            <ListInfo title={"Call"} info={callName} canCopy={false} />
            {sender && (
              <ListInfo title={"Sender (from)"} info={sender} canCopy={true} />
            )}
            {destination && (
              <ListInfo
                title={"Destination (to)"}
                info={destination}
                canCopy={destination !== "-" ? true : false}
              />
            )}
            {value && <ListInfo title={"Value"} info={value} canCopy={false} />}
            {estimatedFee && (
              <ListInfo
                title={"Estimated Fee"}
                info={estimatedFee}
                canCopy={false}
              />
            )}
            {partialFee && (
              <ListInfo title={"Used Fee"} info={partialFee} canCopy={false} />
            )}
            <ListInfo
              title={"Nonce"}
              info={nonce ? nonce : "-"}
              canCopy={false}
            />
            <ListInfo
              title={"Result"}
              info={complete === 1 ? "Success" : "Not Success"}
              canCopy={false}
            />
            {callArguments && (
              <ListInfo
                title={"Parameters"}
                info={JSON.stringify(JSON.parse(callArguments), null, 2)}
                canCopy={false}
                isCode={true}
              />
            )}
            <ListInfo
              title={"Signature"}
              info={signature ? signature : "-"}
              canCopy={false}
            />
          </div>
          <div className="menu-holder">
            <div className="menu-item active">Events ({events.length})</div>
          </div>
          <Table
            header={eventsHeader}
            array={prepareTableArray(events, "events")}
          />
        </React.Fragment>
      )}
      {errorData && (
        <ErrorData error={"No available data for Extrinsic #" + number} />
      )}
    </React.Fragment>
  );
};

export default Transfer;
