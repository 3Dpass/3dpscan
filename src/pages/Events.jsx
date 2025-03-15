import "../styles/events.css";

import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Pagination from "../components/Pagination";
import Table from "../components/Table";
import axiosInstance from "../api/axios";
import moment from "moment";
import { toast } from "react-toastify";

const Events = () => {
  const { page } = useParams();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [pageKey, setPageKey] = useState(null);
  const [pagination, setPagination] = useState({});
  const headersTable = [
    "Block",
    "Event Id",
    "Event Module",
    "Event Name",
    "Time",
  ];
  const [blockNumber, setBlockNumber] = useState("");
  const [eventModule, setEventModule] = useState("");
  const [eventName, setEventName] = useState("");
  const [filters, setFiltersString] = useState(``);

  useEffect(() => {
    setPageKey(page);
  }, [page, pageKey]);

  useEffect(() => {
    if (pageKey) {
      const getEvents = async () => {
        const postData = {
          query: `query{getEvents(pageKey: "${pageKey}", pageSize: 12, ${filters}) {pageInfo{pageSize, pageNext, pagePrev}, objects{blockNumber, eventIdx, extrinsicIdx, blockDatetime, event, eventModule, eventName}}}`,
        };

        const response = await axiosInstance.post("", postData);
        setEvents(response.data.data.getEvents.objects);
        setPagination(response.data.data.getEvents.pageInfo);
      };

      getEvents();
    }
  }, [pageKey, filters]);

  const setFilters = () => {
    let blockNumberFilter = ``;
    let eventModuleFilter = ``;
    let eventNameFilter = ``;

    if (blockNumber !== "") {
      blockNumberFilter = `blockNumber: ${blockNumber}`;
    }

    if (eventModule !== "") {
      eventModuleFilter = `eventModule: "${eventModule}"`;
    }

    if (eventName !== "") {
      eventNameFilter = `eventName: "${eventName}"`;
    }

    if (eventName !== "" && eventModule === "") {
      eventNameFilter = ``;
      toast(
        "If you want to use Event Name as filter you also must include Event Module."
      );
    }

    let filters = `filters: {${blockNumberFilter} ${eventModuleFilter} ${eventNameFilter}}`;
    setPageKey(1);
    setFiltersString(filters);
  };

  const prepareTableArray = (arr) => {
    if (!arr.length) {
      return [];
    }

    let array = [];
    for (let i = 0; i < arr.length; i++) {
      let item = arr[i];
      array.push([
        {
          val: item.blockNumber,
          url: "/block/" + item.blockNumber,
        },
        {
          val: item.blockNumber + "-" + item.eventIdx,
          url: "/event/" + item.blockNumber + "-" + item.eventIdx,
        },
        { val: item.eventModule },
        { val: item.eventName },
        { val: moment(item.blockDatetime).fromNow() },
      ]);
    }

    return array;
  };

  const updatePage = (page) => {
    navigate("/events/" + page.toString());
  };

  return (
    <React.Fragment>
      <div className="page-title">EVENTS</div>
      <div className="event-filter-holder">
        <div className="filters-icon-holder">
          <div className="filter-icon"></div>
          <div className="filters-title">Filters</div>
        </div>
        <div className="inputs-filter-holder">
          <input
            type="text"
            className="filter-input"
            placeholder="Block Number"
            value={blockNumber}
            onChange={(e) => setBlockNumber(e.target.value)}
          />
          <input
            type="text"
            className="filter-input middle-input"
            placeholder="Event Module"
            value={eventModule}
            onChange={(e) => setEventModule(e.target.value)}
          />
          <input
            type="text"
            className="filter-input"
            placeholder="Event Name"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
          />
        </div>
        <button
          type="button"
          className="filter-button"
          onClick={() => setFilters()}
        >
          Apply Filter
        </button>
      </div>
      <Table header={headersTable} array={prepareTableArray(events)} />
      <Pagination
        pagePrev={pagination.pagePrev}
        pageNext={pagination.pageNext}
        setPageKey={updatePage}
      />
    </React.Fragment>
  );
};

export default Events;
