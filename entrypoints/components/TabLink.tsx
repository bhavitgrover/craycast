import React from "react";
import arrowImage from "~/assets/arrow.svg";
import settingsImage from "~/assets/settings.svg";

interface TabLinkProps {
  tab: any;
  type: string;
  selected: boolean;
}

function TabLink({ tab, type, selected }: TabLinkProps) {
  return (
    <div>
      <div
        className={`craycast-tab ${selected ? "craycast-tab-selected" : ""}`}
      >
        <div className="tab-left">
          <img
            src={tab.favIconUrl || settingsImage}
            alt="site-icon"
            className="craycast-favicon"
          />
          {tab.title}
        </div>
        <div className={`tab-right ${!selected ? "hidden" : ""}`}>
          <div className="enter-key">Enter</div>
          <img
            src={arrowImage}
            alt=""
            style={{ height: "14px", aspectRatio: "1" }}
          />
        </div>
      </div>
    </div>
  );
}

export default TabLink;
