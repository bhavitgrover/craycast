import React from "react";
import arrowImage from "~/assets/arrow.svg";
import settingsImage from "~/assets/settings.svg";
import bookmarkImage from "~/assets/bookmark.svg";

interface TabLinkProps {
  tab: any;
  type: string;
  selected: boolean;
}

function TabLink({ tab, selected }: TabLinkProps) {
  return (
    <div>
      <div
        className={`craycast-tab ${selected ? "craycast-tab-selected" : ""}`}
      >
        <div className="tab-left">
          <img
            src={
              tab.type === "Tab"
                ? tab.favIconUrl || settingsImage
                : bookmarkImage
            }
            alt="site-icon"
            className="craycast-favicon"
          />
          <span> {tab.title}</span>
          <span className="craycast-tab-type">{tab.type}</span>
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
