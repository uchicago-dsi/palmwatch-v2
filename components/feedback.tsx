"use client";
import { usePathname } from "next/navigation";
import React from "react";
import styles from "./feedback.module.css";

export const Feedback = () => {
  const path = usePathname();
  const url = path === "/" ? "Homepage" : decodeURI(path);
  const [showTooltip, setShowTooltip] = React.useState(false);
  const [modalOpen, setModalOpen] = React.useState(false);

  const copyCurrUrlToClipboard = () => {
    navigator.clipboard.writeText(url);
    setShowTooltip(true);
    setTimeout(() => {
      setShowTooltip(false);
    }, 5000);
  };
  const handleOpen = () => {
    setModalOpen(true);
  };
  return (
    <>
      <button className={styles.trigger} onClick={handleOpen} type="button">
        Feedback
      </button>
      <dialog className={`modal ${modalOpen ? "modal-open" : ""} `}>
        <div className="modal-box prose flex h-full flex-col">
          <h3 className="flex-0 font-bold text-lg">PalmWatch Feedback Form</h3>
          <p className="flex-0">
            Thank you for testing the PalmWatch Beta and providing feedback.
            Please copy and paste the web link below into the form so we can
            better identify the issue.
          </p>
          {/* add copy paste functionality */}
          <div className="flex flex-0 flex-row items-center justify-center space-x-4">
            <p>PalmWatch website URL: </p>
            <pre className="flex-1">{url}</pre>
            <div
              className={`tooltip flex-0 ${
                showTooltip ? "tooltip-open" : "disabled"
              }`}
              data-tip={showTooltip ? "Copied!" : null}
            >
              <button
                className="btn btn-sm"
                onClick={copyCurrUrlToClipboard}
                type="button"
              >
                Copy
              </button>
            </div>
          </div>
          <iframe
            className="flex-1 border-base-300 shadow-inner"
            src="https://docs.google.com/forms/d/e/1FAIpQLSc_bWuT5T4WKu0kfU4rbuUqaSlbCtNfTTWdRrt2pc7AmShqUQ/viewform?embedded=true"
            title="PalmWatch feedback form"
          >
            Loading…
          </iframe>
          <div className="modal-action">
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button
                className="btn"
                onClick={() => setModalOpen(false)}
                type="button"
              >
                Close
              </button>
            </form>
          </div>
        </div>
        <form className="modal-backdrop" method="dialog">
          <button onClick={() => setModalOpen(false)} type="button">
            close
          </button>
        </form>
      </dialog>
    </>
  );
};
