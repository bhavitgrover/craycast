import React from "react";

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
        <img
          src={tab.favIconUrl || "https://i.ibb.co/5xsyJx78/settings.jpg"}
          alt="site-icon"
          className="craycast-favicon"
        />
        {tab.title}
      </div>
    </div>
  );
}

export default TabLink;
