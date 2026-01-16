import { useEffect, useRef, useState } from "react";

export type ConnectionState = "none" | "waiting" | "active" | "done";

export type AsyncSnapshot<T> =
  | { connectionState: "none"; data?: T; error?: unknown }
  | { connectionState: "waiting"; data?: T; error?: unknown }
  | { connectionState: "active"; data: T; error?: undefined }
  | { connectionState: "done"; data?: T; error?: unknown };

  type FutureBuilderProps<T> = {
    promise?: Promise<T>;
    initialData?: T;
    builder: (snapshot: AsyncSnapshot<T>) => React.ReactNode;
  };
  
  export function PromiseBuilder<T>({
    promise,
    initialData,
    builder,
  }: FutureBuilderProps<T>) {
    const [snapshot, setSnapshot] = useState<AsyncSnapshot<T>>(
      initialData !== undefined
        ? { connectionState: "none", data: initialData }
        : { connectionState: "none" },
    );
  
    const executedRef = useRef<Promise<T> | null>(null);
  
    useEffect(() => {
      if (!promise) return;
  
      if (executedRef.current === promise) return;
  
      executedRef.current = promise;
  
      let cancelled = false;
      setSnapshot({ connectionState: "waiting" });
  
      promise.then(
        (data) => {
          if (!cancelled) {
            setSnapshot({ connectionState: "done", data });
          }
        },
        (error) => {
          if (!cancelled) {
            setSnapshot({ connectionState: "done", error });
          }
        },
      );
  
      return () => {
        cancelled = true;
      };
    }, [promise]);
  
    return <>{builder(snapshot)}</>;
  }