"use client";
import React from "react";
import { usePathname } from "next/navigation";
export const Feedback = () => {
  const path = usePathname();
  const modal = React.useRef(null);
  const [showTooltip, setShowTooltip] = React.useState(false);
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const currUrl = `${baseUrl}${path}`;

  const copyCurrUrlToClipboard = () => {
    navigator.clipboard.writeText(currUrl);
    setShowTooltip(true);
    setTimeout(() => {
      setShowTooltip(false);
    }, 5000);
  };
  return (
    <>
      <button
        className="btn btn-sm normal-case rounded-r-none fixed right-0 bottom-[50%] translate-y-[50%] bg-accent rounded-full shadow-xl z-50"
        // @ts-ignore
        onClick={() => modal?.current?.showModal()}
      >
        Feedback
      </button>
      <dialog className="modal" ref={modal}>
        <div className="modal-box prose flex flex-col h-full">
          <h3 className="font-bold text-lg flex-0">PalmWatch Feedback Form</h3>
          <p className="flex-0">
            Thank you for testing the PalmWatch Beta and providing feedback.
            Please copy and paste the web link below into the form so we can
            better identify the issue.
          </p>
          {/* add copy paste functionality */}
          <div className="flex-0 flex flex-row space-x-4 justify-center items-center">
            <pre className="flex-1">{currUrl}</pre>
            <div
              className={`flex-0 tooltip ${
                showTooltip ? "tooltip-open" : "disabled"
              }`}
              data-tip={showTooltip ? "Copied!" : null}
            >
              <button className="btn btn-sm" onClick={copyCurrUrlToClipboard}>
                Copy
              </button>
            </div>
          </div>
          <iframe
            src="https://docs.google.com/forms/d/e/1FAIpQLSc_bWuT5T4WKu0kfU4rbuUqaSlbCtNfTTWdRrt2pc7AmShqUQ/viewform?embedded=true"
            className="flex-1"
          >
            Loading…
          </iframe>
          <div className="modal-action">
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className="btn">Close</button>
            </form>
          </div>
        </div>
      </dialog>
    </>
  );
};
