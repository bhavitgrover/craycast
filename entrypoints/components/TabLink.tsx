import React from "react";

function TabLink({ tab }: { tab: any }) {
  return (
    <div>
      <div className="craycast-tab">
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
