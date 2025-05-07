import React from "react";
import "./groupIntro.css";

function GroupIntro({ title, subtitle }) {
  return (
    <div className="group-intro-container">
      <h2>{title}</h2>
      <p>{subtitle}</p>
    </div>
  );
}

export default GroupIntro;