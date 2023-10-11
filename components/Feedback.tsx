"use client";
import React from "react";
import { usePathname } from "next/navigation";
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
  }
  return (
    <>
      <button
        className="btn btn-sm normal-case rounded-r-none fixed right-0 bottom-[50%] bg-accent rounded-full shadow-xl z-50"
        // @ts-ignore
        onClick={handleOpen}
      >
        Feedback
      </button>
      <dialog className={`modal ${modalOpen ? 'modal-open' : ''} `}>
        <div className="modal-box prose flex flex-col h-full">
          <h3 className="font-bold text-lg flex-0">PalmWatch Feedback Form</h3>
          <p className="flex-0">
            Thank you for testing the PalmWatch Beta and providing feedback.
            Please copy and paste the web link below into the form so we can
            better identify the issue.
          </p>
          {/* add copy paste functionality */}
          <div className="flex-0 flex flex-row space-x-4 justify-center items-center">
            <p>PalmWatch website URL: </p>
            <pre className="flex-1">{url}</pre>
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
            className="flex-1 shadow-inner border-neutral-500"
          >
            Loading…
          </iframe>
          <div className="modal-action">
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className="btn" onClick={() => setModalOpen(false)}>Close</button>
            </form>

          </div>
        </div>
            <form method="dialog" className="modal-backdrop">
              <button onClick={() => setModalOpen(false)}>close</button>
            </form>
      </dialog>
    </>
  );
};
