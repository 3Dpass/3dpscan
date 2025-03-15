import { ApiPromise, WsProvider } from "@polkadot/api";
import { RPC_CONFIG, RPC_TYPES } from "../constants/RpcConfs";
import React, { useEffect, useState } from "react";

import { Link } from "react-router-dom";

const Objects = () => {
  const [objects, setObjects] = useState([]);

  useEffect(() => {
    const getObjects = async () => {
      const wsProvider = new WsProvider("wss://rpc.3dpscan.io");
      const api = await ApiPromise.create({
        provider: wsProvider,
        types: RPC_TYPES,
        rpc: RPC_CONFIG,
      });

      const totalObjects = await api.query.poScan.objCount();

      let arr = [];
      for (let i = 0; i < totalObjects.toNumber(); i++) {
        arr.push(i);
      }

      setObjects(arr);
    };

    getObjects();
  }, []);
  return (
    <React.Fragment>
      <div className="header-with-icon">
        <div className="header-icon block-icon-header"></div>
        <div className="header-icon-title">Objects</div>
      </div>
      <div className="home-list-holder">
        {objects.map((item, i) => (
          <Link to={"/object/" + item} key={i}>
            <div className="home-list-inner">
              <div className="home-list-left">
                <div className="list-left-info mb5">
                  Object#
                  <span>{item}</span>
                </div>
              </div>
              <div className="home-list-right"></div>
            </div>
          </Link>
        ))}
      </div>
    </React.Fragment>
  );
};

export default Objects;
