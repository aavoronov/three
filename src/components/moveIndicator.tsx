import { useRef } from "react";
import { CSSTransition } from "react-transition-group";

const MoveIndicator = ({ startPoint, endPoint }: { startPoint: [number, number]; endPoint: [number, number] }) => {
  const nodeRef = useRef(null);
  return (
    <CSSTransition in appear timeout={300} nodeRef={nodeRef} classNames='pointer'>
      <span
        ref={nodeRef}
        style={{
          backgroundImage: "url('/movePointer.svg')",
          backgroundSize: "50px 60px",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "-10px -10px",
          width: 37,
          height: 40,
          zIndex: 1000,
          position: "absolute",
        }}>
        <style jsx>
          {`
            .pointer-appear {
              left: ${startPoint[0]}px;
              top: ${startPoint[1]}px;
            }
            .pointer-appear-active {
              left: ${endPoint[0]}px;
              top: ${endPoint[1]}px;
              transition: all 0.3s cubic-bezier(1, -0.02, 0.78, 0.38);
            }
            .pointer-appear-done {
              left: ${endPoint[0]}px;
              top: ${endPoint[1]}px;
            }
          `}
        </style>
      </span>
    </CSSTransition>
  );
};

export default MoveIndicator;
