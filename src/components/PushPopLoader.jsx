import React from "react";

const PushPopLoader = ({
  message = "Your plan is being loaded",
  submessage = "Please wait a moment",
  color = "#2a9d8f",
}) => {
  return (
    <div className="push-pop-loader-container">
      <div className="push-pop loader" style={{ "--primary-color": color }}>
        <div></div>
        <div></div>
      </div>
      <div>
        <div className="push-pop-loader-text" style={{ color }}>
          {message}
          <span className="loading-dots"></span>
        </div>
        {submessage && (
          <div className="push-pop-loader-subtext" style={{ color }}>
            {submessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default PushPopLoader;
