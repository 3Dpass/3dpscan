import { Link } from "react-router-dom";
import moment from "moment";

const BlockPreview = ({ block }) => {
  const { number, countEvents, countLogs, countExtrinsics, datetime } = block;

  return (
    <Link to={`/block/${number}`}>
      <div className="home-list-inner">
        <div className="home-list-left">
          <div className="list-left-info mb5">
            Block#<span>{number}</span>
          </div>
          <div className="list-left-info">
            Includes: <span>{countEvents}</span> Events <span>{countLogs}</span>{" "}
            Logs <span>{countExtrinsics}</span> Extrinsics
          </div>
        </div>
        <div className="home-list-right">
          <div className="home-timestamp">{moment(datetime).fromNow()}</div>
        </div>
      </div>
    </Link>
  );
};

export default BlockPreview;
