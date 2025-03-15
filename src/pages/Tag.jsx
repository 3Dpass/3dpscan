import "../styles/account.css";

import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import Table from "../components/Table";
import ErrorData from "../components/ErrorData";
import axiosHashInstance from "../api/axiosHashApi";

const Tag = () => {
  const navigate = useNavigate();
  const { tag } = useParams();
  const [searchResults, setSearchResults] = useState([]);
  const [errorData, setErrorData] = useState(false);
  const headersTable = [
    "Address",
    "Display Name",
    "Discord",
    "Legal Name",
    "Twitter",
    "Email",
    "Web",
  ];

  useEffect(() => {
    const getTag = async () => {
      try {
      const response = await axiosHashInstance.get(`/search/${tag}`);
      
      const addresses = response.data;

      if (addresses && addresses.length === 1) {
        setErrorData(false);
        navigate(`/account/${addresses[0].address}`);
      } else if (addresses && addresses.length > 1) {
        setSearchResults(addresses);
      } else {
        setErrorData(true);
      }
  } catch (error) {
      alert(`No result found for the given tag: ${tag}`);
    }
    };

    getTag();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tag]);

  const prepareTableArray = (arr) => {
    let array = [];

    if (!arr || arr.length === 0) {
      return array;
    }

    for (let i = 0; i < arr.length; i++) {
      let item = arr[i];
      array.push([
        { val: item.address ? 
          ( 
          <Link to={`/account/${item.address}`} > {item.address}</Link>
          ) : ( 
                "-" ), 
        },
        { val: item.displayName ? item.displayName : "-" },
        { val: item.discord ? item.discord : "-" },
        { val: item.legalName ? item.legalName : "-" },
        { val: item.twitter ? item.twitter : "-" },
        { val: item.email ? item.email : "-" },
        { val: item.web ? item.web : "-" },
      ]);
    }

    return array;
  };

  return (
    <React.Fragment>
    {!errorData && (
    <React.Fragment>
      <div className="page-title">TAG SEARCH RESULTS</div>
      <Table header={headersTable} array={prepareTableArray(searchResults)} />
    </React.Fragment>
    )}
    {errorData && (
      <React.Fragment>
        <div className="page-title">TAG SEARCH RESULTS</div>
        <ErrorData error={"No available data for Tag #" + tag} />
        </React.Fragment>
      )}
    </React.Fragment>
  );
};

export default Tag;
