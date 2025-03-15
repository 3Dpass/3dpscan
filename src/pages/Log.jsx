import React, { useEffect, useState } from "react";

import ListInfo from "../components/ListInfo";
import axiosInstance from "../api/axios";
import moment from "moment";
import { useParams } from "react-router-dom";

const Log = () => {
  const { number } = useParams();
  const [log, setLog] = useState({});

  useEffect(() => {
    const splitParam = number.split("-");
    const getLog = async (block, number) => {
      const postLog = {
        query: `{
        getLog(
            filters:
            {blockNumber: ${block} logIdx: ${number}}
          ){
            data  
            blockNumber
            typeName
            blockDatetime
            typeId
            specName
            specVersion
            complete    
          }
        }`,
      };

      const responseLog = await axiosInstance.post("", postLog);
      setLog(responseLog.data.data.getLog);
    };

    getLog(splitParam[0], splitParam[1]);
  }, [number]);

  const {
    blockNumber,
    blockDatetime,
    complete,
    specName,
    specVersion,
    typeName,
  } = log;

  return (
    <React.Fragment>
      <div className="page-title">LOG #{number}</div>
      <div className="info-holder">
        <ListInfo
          title={"Block"}
          info={blockNumber}
          canCopy={false}
          url={"/block/" + blockNumber}
        />
        <ListInfo
          title={"Block Time"}
          info={moment(blockDatetime).fromNow()}
          canCopy={false}
        />
        <ListInfo
          title={"Status"}
          info={complete ? "Success" : "Not Success"}
          canCopy={false}
        />
        <ListInfo title={"Spec Name"} info={specName} canCopy={false} />
        <ListInfo title={"Spec Version"} info={specVersion} canCopy={false} />
        <ListInfo title={"Type Name"} info={typeName} canCopy={false} />
      </div>
    </React.Fragment>
  );
};

export default Log;
