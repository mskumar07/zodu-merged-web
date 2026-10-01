import type { ReactNode, SyntheticEvent } from "react";
import { runIfSubscribed } from "@utils/subscriptionGuard";

// Wrap any group of controls that write data (a form body, an upload area, a
// submit button). On a view-only business the interaction is swallowed before
// it reaches the control — a select doesn't open, a field doesn't focus, a file
// picker doesn't appear — and the expired modal shows. Otherwise it is a
// transparent pass-through.
//
// Two details matter:
//  - MUI selects / text fields react on mouse-down (and Enter / arrow keys), not
//    click, so those are intercepted as well.
//  - React events bubble out of portals (select menus, popovers, the modal
//    itself) into this wrapper. Only events whose DOM target is really inside
//    the wrapper count, otherwise the modal / menus would re-trigger the guard
//    and navigation elsewhere on the page would feel locked.
const OPEN_KEYS = new Set(["Enter", " ", "ArrowDown", "ArrowUp"]);

const ReadOnlyClickGuard: React.FC<{ children: ReactNode }> = ({ children }) => {
  const block = (e: SyntheticEvent) => {
    if (!(e.target instanceof Node) || !e.currentTarget.contains(e.target)) return;
    if (runIfSubscribed()) return;
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div
      style={{ display: "contents" }}
      onMouseDownCapture={block}
      onClickCapture={block}
      onKeyDownCapture={(e) => OPEN_KEYS.has(e.key) && block(e)}
    >
      {children}
    </div>
  );
};

export default ReadOnlyClickGuard;
