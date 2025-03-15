import React, { useEffect, useState } from "react";

import ErrorData from "../components/ErrorData";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { RPC_CONFIG, RPC_TYPES } from "../constants/RpcConfs";
import ListInfo from "../components/ListInfo";
import axiosInstance from "../api/axios";
import moment from "moment";
import { useParams } from "react-router-dom";

const Event = () => {
  const { number } = useParams();
  const [event, setEvent] = useState({});
  const [eventId, setEventId] = useState(0);
  const [errorData, setErrorData] = useState(false);
  const [metadata, setMetadata] = useState(null);

  useEffect(() => {
    const splitParam = number.split("-");
    setEventId(parseInt(splitParam[1]));
    const getEvent = async (block, number) => {
      const postEvent = {
        query: `{
            getEvent(filters: {blockNumber: ${block} eventIdx: ${number}})
              {
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
          }`,
      };

      const responseEvent = await axiosInstance.post("", postEvent);
      if (responseEvent.data.data && responseEvent.data.data.getEvent) {
        
        setEvent(responseEvent.data.data.getEvent);
        setErrorData(false);
      } else {
        setErrorData(true);
      }
    };

    getEvent(splitParam[0], splitParam[1]);
  }, [number]);

  const fetchMetadata = async (assetId) => {
    
    try {
      const wsProvider = new WsProvider("wss://rpc.3dpscan.io");
      const api = await ApiPromise.create({
              provider: wsProvider,
              types: RPC_TYPES,
              rpc: RPC_CONFIG,
            });
      const assetDetails = await api.query.poscanAssets.metadata(assetId);
      return assetDetails.toHuman();
    } catch (error) {
      return null;
    }
  };

  useEffect(() => {
  
    if (
      event.eventModule === "PoscanAssets" && 
      event.eventName === "Transferred" && 
      event.attributes
    ) {
  
      try {
        const parsedAttributes = JSON.parse(event.attributes);
  
        if (parsedAttributes && parsedAttributes.length > 0) {
          const assetId = parsedAttributes[0];
  
          fetchMetadata(assetId)
            .then((meta) => {
              
              setMetadata(meta);
            })
            .catch((error) => {
            });
        }
      } catch (err) {
      }
    }
  }, [event]);

  const {
    attributes,
    blockDatetime,
    blockHash,
    complete,
    eventModule,
    eventName,
    phaseName,
    specName,
    specVersion,
  } = event;

  const parsedAttributes = attributes ? JSON.parse(attributes) : {};

  return (
    <React.Fragment>
      <div className="page-title">EVENT #{number}</div>
      {!errorData && (
        <React.Fragment>
          <div className="info-holder">
            <ListInfo
              title={"Block Time"}
              info={moment(blockDatetime).fromNow()}
              canCopy={false}
            />
            <ListInfo title={"Block Hash"} info={blockHash} canCopy={true} />
            <ListInfo
              title={"Status"}
              info={complete ? "Success" : "Not Success"}
              canCopy={false}
            />
            {eventId === 0 && typeof parsedAttributes === "object" && (
              <>
                {parsedAttributes.class && (
                  <ListInfo
                    title={"Class"}
                    info={parsedAttributes.class}
                    canCopy={false}
                  />
                )}

                {parsedAttributes.weight && (
                  <ListInfo
                    title={"Weight"}
                    info={parsedAttributes.weight}
                    canCopy={false}
                  />
                )}
                {parsedAttributes.pays_fee && (
                  <ListInfo
                    title={"Pays Fee"}
                    info={parsedAttributes.pays_fee}
                    canCopy={false}
                  />
                )}
              </>
            )}
            {event.eventModule === "PoscanAssets" &&
          event.eventName === "Transferred" &&
          parsedAttributes &&
          parsedAttributes.length >= 4 ? (
            <>
              <ListInfo
                title={"Asset ID"}
                info={parsedAttributes[0]}
                canCopy={false}
              />
              <ListInfo
                title={"Author ID"}
                info={parsedAttributes[1]}
                canCopy={true}
                url={"/account/" + parsedAttributes[1]}
              />
              <ListInfo
                title={"Receiver ID"}
                info={parsedAttributes[2]}
                canCopy={true}
                url={"/account/" + parsedAttributes[2]}
              />
              {metadata ? (
                <ListInfo
                  title={"Value"}
                  info={`${(
                    parseInt(parsedAttributes[3]) /
                    Math.pow(10, metadata.decimals)
                  ).toFixed(4)} ${metadata.symbol}`}
                  canCopy={false}
                />
              ) : (
                <ListInfo
                  title={"Value"}
                  info={"Loading metadata..."}
                  canCopy={false}
                />
              )}
            </>
          ) : (
            parsedAttributes &&
            parsedAttributes.length > 0 && (
              <>
                {parsedAttributes[0] && (
                  <ListInfo
                    title={"Author ID"}
                    info={parsedAttributes[0]}
                    canCopy={true}
                    url={"/account/" + parsedAttributes[0]}
                  />
                )}
                {parsedAttributes[1] && (
                  <ListInfo
                    title={"Value"}
                    info={`${
                      (parseInt(parsedAttributes[1]) / 1000000000000).toFixed(
                        4
                      ) + " P3D"
                    }`}
                    canCopy={false}
                  />
                )}
              </>
            )
          )}
            <ListInfo
              title={"Event Module"}
              info={eventModule}
              canCopy={false}
            />
            <ListInfo title={"Event Name"} info={eventName} canCopy={false} />
            <ListInfo title={"Phase Name"} info={phaseName} canCopy={false} />
            <ListInfo title={"Spec Name"} info={specName} canCopy={false} />
            <ListInfo
              title={"Spec Version"}
              info={specVersion}
              canCopy={false}
            />
          </div>
        </React.Fragment>
      )}
      {errorData && (
        <ErrorData error={"No available data for Event #" + number} />
      )}
    </React.Fragment>
  );
};

export default Event;
