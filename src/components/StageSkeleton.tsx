import "./Stage.css";
import { Panel } from "../ui/Panel";
import { Skeleton } from "../ui/Skeleton";

//a grey outline of the Stage (the top screen). built from the Stage's own
//classes and the same sizes (240px sprite box), so when the real Stage
//replaces it, nothing moves. every Skeleton is decorative: whoever uses this
//is responsible for announcing "loading" once
export function StageSkeleton() {
  return (
    <Panel variant="tinted">
      <div className="stage">
        <header className="stage__header">
          <Skeleton width={48} height={14} decorative />
          <Skeleton width={160} height={28} decorative />
          <Skeleton width={120} height={24} decorative />
        </header>
        <div className="stage__sprite">
          <Skeleton width={240} height={240} shape="circle" decorative />
        </div>
        <Skeleton width={120} height={24} decorative />
      </div>
    </Panel>
  );
}
