import "./TCGCardSkeleton.css";
import { Skeleton } from "../ui/Skeleton";

export function TCGCardSkeleton() {
  return (
    <div className="tcg-card-skeleton">
      <div className="tcg-card-skeleton__img">
        <Skeleton width="100%" height="100%" decorative />
      </div>
      <div className="tcg-card-skeleton__info">
        <Skeleton width="80%" height={16} decorative />
        <Skeleton width="60%" height={12} decorative />
        <Skeleton width="40%" height={12} decorative />
      </div>
    </div>
  );
}
